import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { initialContent, type Article } from "@/data/initialContent";
import { hasAdminSession, isSameOriginRequest } from "@/lib/adminAuth";
import {
  getGitHubContentConfig,
  getGitHubContentFileUrl,
  getLocalContentPath,
} from "@/lib/getContent";
import fs from "fs/promises";

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

function unauthorized() {
  return NextResponse.json({ success: false, message: "Autentikasi admin diperlukan." }, { status: 401, headers: noStoreHeaders });
}

function storageUnavailable(message: string) {
  return NextResponse.json({ success: false, message }, { status: 503, headers: noStoreHeaders });
}

async function readLocalJson(filePath: string) {
  try {
    return JSON.parse(await fs.readFile(getLocalContentPath(filePath), "utf-8"));
  } catch {
    return null;
  }
}

async function readGitHubJson(config: NonNullable<ReturnType<typeof getGitHubContentConfig>>, filePath: string) {
  const response = await fetch(getGitHubContentFileUrl(config, true, filePath), {
    headers: { Authorization: `Bearer ${config.pat}`, Accept: "application/vnd.github.raw+json" },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Gagal membaca ${filePath} dari GitHub (${response.status}).`);
  return JSON.parse(await response.text());
}

async function writeGitHubJson(
  config: NonNullable<ReturnType<typeof getGitHubContentConfig>>,
  filePath: string,
  value: unknown,
  message: string,
) {
  const metadataResponse = await fetch(getGitHubContentFileUrl(config, true, filePath), {
    headers: { Authorization: `Bearer ${config.pat}`, Accept: "application/vnd.github.v3+json" },
    cache: "no-store",
  });

  let sha: string | undefined;
  let currentValue: unknown;
  if (metadataResponse.ok) {
    const file = await metadataResponse.json();
    sha = file.sha;
    if (typeof file.content === "string" && file.content.length > 0) {
      currentValue = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
    }
  } else if (metadataResponse.status !== 404) {
    throw new Error(`Gagal memeriksa ${filePath} sebelum menyimpan (${metadataResponse.status}).`);
  }

  if (currentValue !== undefined && JSON.stringify(currentValue) === JSON.stringify(value)) {
    return { changed: false, sha };
  }

  const response = await fetch(getGitHubContentFileUrl(config, false, filePath), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.pat}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(value, null, 2), "utf-8").toString("base64"),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const detail = typeof errorData?.message === "string" ? errorData.message : response.statusText;
    throw new Error(`Gagal menyimpan ${filePath} ke GitHub: ${detail}`);
  }

  const result = await response.json();
  return { changed: true, sha: result.content?.sha as string | undefined };
}

export async function GET(request: Request) {
  if (!hasAdminSession(request)) return unauthorized();

  try {
    const config = getGitHubContentConfig();
    if (!config) {
      if (process.env.NODE_ENV === "production") {
        return storageUnavailable("Penyimpanan CMS belum dikonfigurasi di server.");
      }
      const localContent = await readLocalJson(process.env.GITHUB_PATH || "content.json");
      if (!localContent) return storageUnavailable("File konten lokal tidak ditemukan.");
      const separateArticles = await readLocalJson("articles.json");
      const articles = Array.isArray(separateArticles) ? separateArticles : (Array.isArray(localContent.articles) ? localContent.articles : []);
      return NextResponse.json({ success: true, content: { ...localContent, articles }, source: "local-file" }, { headers: noStoreHeaders });
    }

    const [siteContent, separateArticles] = await Promise.all([
      readGitHubJson(config, config.path),
      readGitHubJson(config, "articles.json"),
    ]);
    if (!siteContent || typeof siteContent !== "object") {
      return NextResponse.json({ success: false, message: "File konten CMS tidak ditemukan." }, { status: 502, headers: noStoreHeaders });
    }

    const legacyArticles = Array.isArray((siteContent as { articles?: Article[] }).articles)
      ? (siteContent as { articles: Article[] }).articles
      : [];
    const articles = Array.isArray(separateArticles) ? separateArticles as Article[] : legacyArticles;
    return NextResponse.json({
      success: true,
      content: { ...siteContent, articles },
      source: "github",
    }, { headers: noStoreHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Konfigurasi penyimpanan tidak valid.";
    return storageUnavailable(message);
  }
}

export async function POST(request: Request) {
  if (!hasAdminSession(request)) return unauthorized();
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "Permintaan lintas origin ditolak." }, { status: 403, headers: noStoreHeaders });
  }

  try {
    const body = await request.json();
    let content = body?.content;
    if (body?.syncInitial === true) {
      if (!Array.isArray(body.articles)) {
        return NextResponse.json({ success: false, message: "Artikel harus disertakan saat sinkronisasi default." }, { status: 400, headers: noStoreHeaders });
      }
      content = { ...initialContent, articles: body.articles };
    }
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return NextResponse.json({ success: false, message: "Format konten tidak valid." }, { status: 400, headers: noStoreHeaders });
    }

    const articlesProvided = Array.isArray(content.articles);
    const siteContent = { ...content } as Record<string, unknown>;
    delete siteContent.articles;

    const config = getGitHubContentConfig();
    if (!config) {
      if (process.env.NODE_ENV === "production") {
        return storageUnavailable("Penyimpanan CMS belum dikonfigurasi di server.");
      }

      const currentLocalContent = await readLocalJson(process.env.GITHUB_PATH || "content.json");
      const currentLocalArticles = await readLocalJson("articles.json");
      const legacyArticles = Array.isArray(currentLocalContent?.articles) ? currentLocalContent.articles : [];
      const articles = articlesProvided
        ? content.articles as Article[]
        : Array.isArray(currentLocalArticles) ? currentLocalArticles as Article[] : legacyArticles;

      await fs.writeFile(getLocalContentPath(process.env.GITHUB_PATH || "content.json"), JSON.stringify(siteContent, null, 2), "utf-8");
      await fs.writeFile(getLocalContentPath("articles.json"), JSON.stringify(articles, null, 2), "utf-8");
      revalidateAfterSave(true, true);
      return NextResponse.json({ success: true, message: "Konten dan artikel tersimpan di file lokal development.", source: "local-file" }, { headers: noStoreHeaders });
    }

    let articles: Article[];
    if (articlesProvided) {
      articles = content.articles as Article[];
    } else {
      const existingArticles = await readGitHubJson(config, "articles.json");
      if (Array.isArray(existingArticles)) articles = existingArticles as Article[];
      else {
        const legacyContent = await readGitHubJson(config, config.path);
        const legacyArticles = (legacyContent as { articles?: Article[] } | null)?.articles;
        articles = Array.isArray(legacyArticles) ? legacyArticles : [];
      }
    }

    // Save the article collection separately first. The public site-content file
    // is only written when non-article fields actually change.
    const articleResult = await writeGitHubJson(
      config,
      "articles.json",
      articles,
      `Update Hansen Projects articles (${new Date().toISOString()})`,
    );
    const siteResult = await writeGitHubJson(
      config,
      config.path,
      siteContent,
      `Update Hansen Projects site content (${new Date().toISOString()})`,
    );

    revalidateAfterSave(siteResult.changed, articleResult.changed);
    return NextResponse.json({
      success: true,
      message: articleResult.changed || siteResult.changed
        ? "Konten dan artikel berhasil disimpan secara terpisah di GitHub."
        : "Tidak ada perubahan baru untuk disimpan.",
      source: "github",
      changed: { siteContent: siteResult.changed, articles: articleResult.changed },
    }, { headers: noStoreHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan konten.";
    return NextResponse.json({ success: false, message }, { status: 500, headers: noStoreHeaders });
  }
}

function revalidateAfterSave(siteContentChanged: boolean, articlesChanged: boolean) {
  try {
    if (siteContentChanged) {
      revalidateTag("site-content", { expire: 0 });
    }
    if (articlesChanged) {
      revalidateTag("site-articles", { expire: 0 });
      revalidatePath("/artikel");
      revalidatePath("/sitemap.xml");
    }
  } catch (error) {
    console.error("Content cache revalidation failed:", error);
  }
}
