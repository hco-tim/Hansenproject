import { NextResponse } from "next/server";
import { randomUUID, timingSafeEqual } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { getGitHubContentConfig, getGitHubContentFileUrl } from "@/lib/getContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, max-age=0" };
const textFields = ["title", "slug", "excerpt", "category", "coverImage", "coverImageAlt", "author", "publishedAt", "body", "seoTitle", "seoDescription", "focusKeyword"] as const;

function authorized(request: Request) {
  const expected = process.env.ARTICLE_INGEST_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\\s+/i, "");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status, headers: noStore });
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  if (!authorized(request)) return fail("Token integrasi tidak valid.", 401);

  try {
    const incoming = await request.json();
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return fail("Body harus berupa objek artikel.", 400);

    const articleInput: Record<string, unknown> = {};
    for (const field of textFields) {
      const value = incoming[field];
      if (value !== undefined && typeof value !== "string") return fail(`Field "${field}" harus berupa teks.`, 400);
      articleInput[field] = typeof value === "string" ? value.trim() : "";
    }

    const title = articleInput.title as string;
    const slug = slugify((articleInput.slug as string) || title);
    if (!title) return fail("Judul artikel wajib diisi.", 400);
    if (!slug) return fail("Slug artikel tidak valid.", 400);
    if ((articleInput.body as string).length > 100000) return fail("Isi artikel melebihi batas 100.000 karakter.", 413);
    if ((articleInput.title as string).length > 180) return fail("Judul artikel maksimal 180 karakter.", 400);
    if ((articleInput.seoDescription as string).length > 320) return fail("Deskripsi SEO maksimal 320 karakter.", 400);

    const config = getGitHubContentConfig();
    if (!config) return fail("Penyimpanan konten GitHub belum dikonfigurasi.", 503);

    const currentResponse = await fetch(getGitHubContentFileUrl(config), {
      headers: { Authorization: `Bearer ${config.pat}`, Accept: "application/vnd.github.v3+json" },
      cache: "no-store",
    });
    if (!currentResponse.ok) return fail(`Gagal membaca konten website dari GitHub (${currentResponse.status}).`, 502);

    const file = await currentResponse.json();
    const currentContent = JSON.parse(Buffer.from(file.content || "", "base64").toString("utf8"));
    const articles = Array.isArray(currentContent.articles) ? currentContent.articles : [];
    if (articles.some((article: { slug?: string }) => article.slug === slug)) return fail(`Slug "${slug}" sudah digunakan. Artikel tidak disimpan.`, 409);

    const article = {
      id: randomUUID(),
      title,
      slug,
      excerpt: articleInput.excerpt as string,
      category: (articleInput.category as string) || "Inspirasi Interior",
      coverImage: articleInput.coverImage as string,
      coverImageAlt: articleInput.coverImageAlt as string,
      author: (articleInput.author as string) || "Hansen Projects",
      publishedAt: (articleInput.publishedAt as string) || new Date().toISOString().slice(0, 10),
      status: "draft" as const,
      body: articleInput.body as string,
      seoTitle: articleInput.seoTitle as string,
      seoDescription: articleInput.seoDescription as string,
      focusKeyword: articleInput.focusKeyword as string,
    };

    const updatedContent = { ...currentContent, articles: [article, ...articles] };
    const writeResponse = await fetch(getGitHubContentFileUrl(config, false), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.pat}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add draft article via Hansen Projects integration: ${slug}`,
        content: Buffer.from(JSON.stringify(updatedContent, null, 2), "utf8").toString("base64"),
        branch: config.branch,
        sha: file.sha,
      }),
      cache: "no-store",
    });

    if (!writeResponse.ok) {
      const details = await writeResponse.json().catch(() => null);
      const message = typeof details?.message === "string" ? details.message : writeResponse.statusText;
      return fail(`GitHub menolak penyimpanan artikel: ${message}`, writeResponse.status === 409 ? 409 : 502);
    }

    revalidateTag("site-content", { expire: 0 });
    revalidatePath("/artikel");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diterima dan disimpan sebagai Draft.",
      article: { id: article.id, slug: article.slug, status: article.status },
    }, { status: 201, headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menerima artikel.";
    return fail(message, 500);
  }
}
