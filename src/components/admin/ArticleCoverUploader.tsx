"use client";

import { useRef, useState } from "react";
import { FiImage, FiTrash2, FiUpload } from "react-icons/fi";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const MAX_OUTPUT_BYTES = 400 * 1024;
const MAX_DIMENSION = 1200;

async function compressToWebP(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, atau WebP. SVG tidak didukung.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Browser tidak dapat memproses gambar.");

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let quality = 0.82;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= MAX_OUTPUT_BYTES) break;
      quality -= 0.1;
    }

    if (!blob) throw new Error("Gagal mengubah gambar menjadi WebP.");
    if (blob.size > MAX_OUTPUT_BYTES) throw new Error("Ukuran gambar hasil kompresi masih lebih dari 400 KB. Pilih gambar yang lebih sederhana.");
    return blob;
  } finally {
    bitmap.close();
  }
}

export default function ArticleCoverUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setError("");
    setBusy(true);

    try {
      const webp = await compressToWebP(file);
      const form = new FormData();
      form.append("file", webp, "cover.webp");

      const response = await fetch("/api/admin/uploads/articles", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const result = await response.json();
      if (!response.ok || !result.success || typeof result.url !== "string") {
        throw new Error(result.message || "Upload gambar gagal.");
      }
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat upload gambar.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-semibold text-[#dbae6b]"><FiImage /> Gambar Sampul Artikel</label>
      <div className="rounded-lg border border-dashed border-[#dbae6b]/40 bg-[#07111e] p-4">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#dbae6b]/40 px-4 py-3 text-xs font-semibold text-[#dbae6b] hover:bg-[#dbae6b]/10 disabled:opacity-50">
          <FiUpload /> {busy ? "Mengompres dan mengunggah..." : "Pilih gambar untuk diunggah"}
        </button>
        <p className="mt-2 text-[11px] text-gray-400">Gambar otomatis dikonversi ke WebP, lebar/tinggi maksimum 1.200 px, ukuran hasil maksimum 400 KB.</p>
      </div>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
      {value && (
        <div className="flex items-center gap-3 rounded border border-white/10 bg-[#07111e] p-2">
          <img src={value} alt="Preview gambar sampul" className="h-16 w-24 rounded object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate text-[11px] text-gray-300">{value}</p><span className="text-[10px] text-emerald-300">URL gambar tersimpan di editor</span></div>
          <button type="button" onClick={() => onChange("")} className="rounded p-2 text-red-300 hover:bg-red-950/40" aria-label="Hapus gambar sampul"><FiTrash2 /></button>
        </div>
      )}
    </div>
  );
}
