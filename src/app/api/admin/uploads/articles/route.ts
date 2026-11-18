import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hasAdminSession, isSameOriginRequest } from "@/lib/adminAuth";
import { getGitHubContentConfig } from "@/lib/getContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 400 * 1024;

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  if (!hasAdminSession(request)) return fail("Autentikasi admin diperlukan.", 401);
  if (!isSameOriginRequest(request)) return fail("Permintaan lintas origin ditolak.", 403);

  try {
    const config = getGitHubContentConfig();
    if (!config) return fail("Penyimpanan GitHub belum dikonfigurasi di server.", 503);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("File gambar tidak ditemukan.", 400);
    if (file.type !== "image/webp") return fail("File harus berupa WebP.", 415);
    if (file.size < 16 || file.size > MAX_FILE_BYTES) return fail("Ukuran gambar harus antara 16 byte dan 400 KB.", 413);

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
      return fail("Isi file bukan gambar WebP yang valid.", 415);
    }

    const filename = `${Date.now()}-${randomUUID()}.webp`;
    const targetBranch = process.env.VERCEL_GIT_COMMIT_REF || config.branch;
    if (!/^[A-Za-z0-9._/-]+$/.test(targetBranch) || targetBranch.includes("..") || targetBranch.startsWith("/") || targetBranch.endsWith("/")) {
      return fail("Branch deployment tidak valid untuk upload gambar.", 500);
    }

    const repositoryPath = `public/uploads/articles/${filename}`;
    const encodedPath = repositoryPath.split("/").map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: "Upload compressed article cover image",
        content: bytes.toString("base64"),
        branch: targetBranch,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message = typeof data?.message === "string" ? data.message : response.statusText;
      return fail(`GitHub menolak upload gambar: ${message}`, 502);
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/articles/${filename}`,
      path: repositoryPath,
      size: bytes.length,
      format: "webp",
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah gambar.";
    return fail(message, 500);
  }
}
