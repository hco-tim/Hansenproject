import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { initialContent } from "@/data/initialContent";
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

async function readLocalContent() {
  const contentPath = getLocalContentPath(process.env.GITHUB_PATH || "content.json");
  const raw = await fs.readFile(contentPath, "utf-8");
  return JSON.parse(raw);
}

export async function GET(request: Request) {
  if (!hasAdminSession(request)) return unauthorized();

  try {
    const config = getGitHubContentConfig();
    if (!config) {
      if (process.env.NODE_ENV === "production") {
        return storageUnavailable("Penyimpanan CMS belum dikonfigurasi di server.");
      }
      return NextResponse.json({ success: true, content: await readLocalContent(), source: "local-file" }, { headers: noStoreHeaders });
    }

    const res = await fetch(getGitHubContentFileUrl(config), {
      headers: { Authorization: `Bearer ${config.pat}`, Accept: "application/vnd.github.raw+json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, message: `Gagal membaca konten GitHub (${res.status}).` }, { status: 502, headers: noStoreHeaders });
    }

    const content = JSON.parse(await res.text());
    return NextResponse.json({ success: true, content, source: "github" }, { headers: noStoreHeaders });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      try {
        return NextResponse.json({ success: true, content: await readLocalContent(), source: "local-file" }, { headers: noStoreHeaders });
      } catch {
        // A missing local file falls through to the configuration error below.
      }
    }
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

    const config = getGitHubContentConfig();
    if (!config) {
      if (process.env.NODE_ENV === "production") {
        return storageUnavailable("Penyimpanan CMS belum dikonfigurasi di server.");
      }
      const contentPath = getLocalContentPath(process.env.GITHUB_PATH || "content.json");
      await fs.writeFile(contentPath, JSON.stringify(content, null, 2), "utf-8");
      revalidateAfterSave();
      return NextResponse.json({ success: true, message: "Konten tersimpan di file lokal development.", source: "local-file" }, { headers: noStoreHeaders });
    }

    const fileUrl = getGitHubContentFileUrl(config, false);
    const currentFileResponse = await fetch(getGitHubContentFileUrl(config), {
      headers: { Authorization: `Bearer ${config.pat}`, Accept: "application/vnd.github.v3+json" },
      cache: "no-store",
    });
    let sha: string | undefined;
    if (currentFileResponse.ok) {
      const file = await currentFileResponse.json();
      sha = file.sha;
    } else if (currentFileResponse.status !== 404) {
      return NextResponse.json({ success: false, message: `Gagal membaca file GitHub sebelum menyimpan (${currentFileResponse.status}).` }, { status: 502, headers: noStoreHeaders });
    }

    const jsonString = JSON.stringify(content, null, 2);
    const response = await fetch(fileUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.pat}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update CMS content via Hansen Admin (${new Date().toISOString()})`,
        content: Buffer.from(jsonString, "utf-8").toString("base64"),
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = typeof errorData?.message === "string" ? errorData.message : response.statusText;
      return NextResponse.json({ success: false, message: `Gagal menyimpan ke GitHub: ${message}` }, { status: 502, headers: noStoreHeaders });
    }

    revalidateAfterSave();
    const result = await response.json();
    return NextResponse.json({ success: true, message: "Berhasil memperbarui file konten di GitHub.", sha: result.content?.sha, source: "github" }, { headers: noStoreHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan konten.";
    return NextResponse.json({ success: false, message }, { status: 500, headers: noStoreHeaders });
  }
}

function revalidateAfterSave() {
  try {
    revalidateTag("site-content", { expire: 0 });
    revalidatePath("/artikel");
    revalidatePath("/sitemap.xml");
  } catch (error) {
    console.error("Content cache revalidation failed:", error);
  }
}
