import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { hasAdminSession, isSameOriginRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 400 * 1024;

function fail(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Atur CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di environment server.",
    );
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName) || !/^[0-9]+$/.test(apiKey)) {
    throw new Error("Konfigurasi Cloudinary tidak valid.");
  }

  return { cloudName, apiKey, apiSecret };
}

function createUploadSignature(
  params: Record<string, string>,
  apiSecret: string,
) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(serialized + apiSecret)
    .digest("hex");
}

export async function POST(request: Request) {
  if (!hasAdminSession(request)) {
    return fail("Autentikasi admin diperlukan.", 401);
  }
  if (!isSameOriginRequest(request)) {
    return fail("Permintaan lintas origin ditolak.", 403);
  }

  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const form = await request.formData();
    const file = form.get("file");
    const requestedFolder = form.get("folder");
    const folder = requestedFolder === "site" ? "site" : "articles";

    if (requestedFolder !== null && requestedFolder !== "site" && requestedFolder !== "articles") {
      return fail("Folder upload tidak diizinkan.", 400);
    }
    if (!(file instanceof File)) {
      return fail("File gambar tidak ditemukan.", 400);
    }
    if (file.type !== "image/webp") {
      return fail("File harus berupa WebP.", 415);
    }
    if (file.size < 16 || file.size > MAX_FILE_BYTES) {
      return fail("Ukuran gambar harus antara 16 byte dan 400 KB.", 413);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (
      bytes.toString("ascii", 0, 4) !== "RIFF" ||
      bytes.toString("ascii", 8, 12) !== "WEBP"
    ) {
      return fail("Isi file bukan gambar WebP yang valid.", 415);
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = randomUUID();
    const cloudinaryFolder = `hansen-projects/${folder}`;
    const signedParams = {
      folder: cloudinaryFolder,
      public_id: publicId,
      timestamp,
    };
    const signature = createUploadSignature(signedParams, apiSecret);

    const uploadForm = new FormData();
    uploadForm.append("file", new Blob([bytes], { type: "image/webp" }), `${publicId}.webp`);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("folder", cloudinaryFolder);
    uploadForm.append("public_id", publicId);
    uploadForm.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadForm, cache: "no-store" },
    );
    const result = await response.json().catch(() => null);

    if (!response.ok || typeof result?.secure_url !== "string") {
      const providerMessage =
        typeof result?.error?.message === "string"
          ? result.error.message
          : "Cloudinary menolak upload gambar.";
      console.error("Cloudinary upload failed:", response.status, providerMessage);
      return fail("Upload ke Cloudinary gagal. Periksa konfigurasi akun dan coba kembali.", 502);
    }

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        path: result.public_id,
        size: bytes.length,
        format: "webp",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat mengunggah gambar.";
    return fail(message, 503);
  }
}
