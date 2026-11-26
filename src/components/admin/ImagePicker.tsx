"use client";

import React, { useState } from "react";
import { FiUpload, FiLink, FiTrash2, FiImage, FiAlertCircle } from "react-icons/fi";

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
}

const MAX_OUTPUT_BYTES = 400 * 1024;
const MAX_DIMENSION = 1600;

async function compressToWebP(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, atau WebP. SVG dapat ditambahkan melalui Link URL.");
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

    for (let attempt = 0; attempt < 7; attempt += 1) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= MAX_OUTPUT_BYTES) break;
      quality -= 0.1;
    }

    if (!blob || blob.size > MAX_OUTPUT_BYTES) {
      throw new Error("Ukuran gambar hasil kompresi masih lebih dari 400 KB. Pilih gambar yang lebih sederhana.");
    }
    return blob;
  } finally {
    bitmap.close();
  }
}

export default function ImagePicker({ label, value, onChange, helpText }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const webp = await compressToWebP(file);
      const form = new FormData();
      form.append("file", webp, "site-image.webp");
      form.append("folder", "site");

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
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2 bg-[#001730]/60 border border-[#dbae6b]/20 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#dbae6b] flex items-center gap-2">
          <FiImage className="text-base" /> {label}
        </label>
        <div className="flex items-center gap-1 bg-[#002044] p-1 rounded-md border border-[#dbae6b]/20 text-[11px]">
          <button type="button" onClick={() => setActiveTab("upload")} className={`px-3 py-1 rounded transition-colors ${activeTab === "upload" ? "bg-[#dbae6b] text-[#002044] font-bold" : "text-gray-300 hover:text-white"}`}>
            Upload File
          </button>
          <button type="button" onClick={() => setActiveTab("url")} className={`px-3 py-1 rounded transition-colors ${activeTab === "url" ? "bg-[#dbae6b] text-[#002044] font-bold" : "text-gray-300 hover:text-white"}`}>
            Link URL
          </button>
        </div>
      </div>

      {helpText && <p className="text-[11px] text-gray-400">{helpText}</p>}
      {errorMsg && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/50 border border-red-800/50 p-2 rounded">
          <FiAlertCircle className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === "upload" ? (
        <div className="relative border-2 border-dashed border-[#dbae6b]/30 hover:border-[#dbae6b] transition-colors rounded-lg p-3 text-center bg-[#002044]/40 cursor-pointer">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void handleFileChange(e)} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="flex flex-col items-center justify-center gap-1 py-1">
            <FiUpload className="text-xl text-[#dbae6b]" />
            <span className="text-xs font-medium text-gray-200">
              {uploading ? "Mengompres dan mengunggah..." : "Klik atau geser file gambar ke sini"}
            </span>
            <span className="text-[10px] text-gray-400">JPG, PNG, WEBP · otomatis WebP · maks. 400 KB</span>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center">
          <FiLink className="absolute left-3 text-gray-400 text-sm" />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://example.com/image.png" className="w-full bg-[#002044] border border-[#dbae6b]/30 text-white text-xs pl-9 pr-3 py-2 rounded focus:outline-none focus:border-[#dbae6b]" />
        </div>
      )}

      {value && (
        <div className="mt-3 flex items-center gap-3 p-2 bg-[#002044]/80 rounded border border-[#dbae6b]/20">
          <div className="relative w-14 h-14 bg-black/40 rounded overflow-hidden shrink-0 border border-white/10">
            <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-gray-300 truncate">{value.startsWith("data:") ? "Gambar lama Base64" : value}</p>
            <span className="text-[10px] text-[#dbae6b]">Gambar aktif</span>
          </div>
          <button type="button" onClick={() => onChange("")} className="text-red-400 hover:text-red-300 p-2 text-sm rounded hover:bg-red-950/50 transition-colors" title="Hapus gambar">
            <FiTrash2 />
          </button>
        </div>
      )}
    </div>
  );
}
