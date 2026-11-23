"use client";

import { useState } from "react";

type Props = { onInsert: (markdown: string) => void };

export default function ArticleInlineImageUploader({ onInsert }: Props) {
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setError("");
    if (file.type !== "image/webp") {
      setError("Gunakan gambar WebP. Konversi gambar ke WebP sebelum mengunggah.");
      return;
    }
    if (file.size > 400 * 1024) {
      setError("Ukuran gambar maksimal 400 KB.");
      return;
    }
    if (!alt.trim()) {
      setError("Isi alt text terlebih dahulu agar gambar memiliki deskripsi aksesibel.");
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file, "article-image.webp");
      const response = await fetch("/api/admin/uploads/articles", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const result = await response.json();
      if (!response.ok || !result.success || typeof result.url !== "string") {
        throw new Error(result.message || "Upload gambar gagal.");
      }
      onInsert(`![${alt.trim()}](${result.url})`);
      setAlt("");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Terjadi kesalahan saat upload gambar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#07111e] p-4">
      <p className="text-xs font-semibold text-[#dbae6b]">Tambahkan gambar ke isi artikel</p>
      <label className="mt-3 block text-xs text-gray-300">Alt text gambar
        <input value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Contoh: Kitchen set berbentuk L dengan finishing kayu oak" className="mt-2 w-full rounded border border-white/10 bg-[#0b1728] px-3 py-2.5 text-sm text-white outline-none focus:border-[#dbae6b]/60" />
      </label>
      <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-[#dbae6b]/40 px-4 py-2.5 text-xs font-semibold text-[#dbae6b] hover:bg-[#dbae6b]/10">
        {busy ? "Mengunggah..." : "Pilih gambar WebP"}
        <input type="file" accept="image/webp" disabled={busy} className="sr-only" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
      </label>
      <p className="mt-2 text-[11px] text-gray-400">Maksimal 400 KB. Gambar akan diunggah dan kode Markdown dengan alt text otomatis ditambahkan di akhir isi artikel.</p>
      {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
