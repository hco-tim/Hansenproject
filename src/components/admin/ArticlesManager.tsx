"use client";

import { useRef, useState } from "react";
import type { Article } from "@/data/initialContent";
import { useContent } from "@/context/ContentContext";
import { appendImportedArticles, previewArticleImport, type ArticleImportRow } from "@/lib/articleImport";
import { FiCheckCircle, FiFileText, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import ArticleCoverUploader from "@/components/admin/ArticleCoverUploader";
import ArticleInlineImageUploader from "@/components/admin/ArticleInlineImageUploader";

const blankArticle = (): Article => ({
  id: crypto.randomUUID(), title: "", slug: "", excerpt: "", category: "Inspirasi Interior",
  coverImage: "", coverImageAlt: "", author: "Hansen Projects", publishedAt: new Date().toISOString().slice(0, 10),
  status: "draft", body: "", seoTitle: "", seoDescription: "",
});

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function ArticlesManager() {
  const { content, updateContent, saveToGitHub, saving } = useContent();
  const articles = content.articles || [];
  const [selectedId, setSelectedId] = useState(articles[0]?.id || "");
  const [editedSlug, setEditedSlug] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<ArticleImportRow[] | null>(null);
  const [importError, setImportError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importOutcome, setImportOutcome] = useState<{ imported: number; failed: number; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedArticle = articles.find((article) => article.id === selectedId);

  const openImport = () => {
    setImportFile(null);
    setImportRows(null);
    setImportError("");
    setImportOutcome(null);
    setIsImportOpen(true);
  };

  const validateImportFile = async () => {
    if (!importFile) {
      setImportError("Pilih file JSON terlebih dahulu.");
      return;
    }

    setIsValidating(true);
    setImportError("");
    setImportRows(null);
    setImportOutcome(null);
    try {
      const parsed = JSON.parse(await importFile.text()) as unknown;
      setImportRows(previewArticleImport(parsed, articles));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "File tidak dapat dibaca.");
    } finally {
      setIsValidating(false);
    }
  };

  const importValidArticles = async () => {
    if (!importRows || isImporting || importOutcome) return;
    const validArticles = importRows.filter((row) => row.errors.length === 0).map((row) => row.article);
    const invalidCount = importRows.length - validArticles.length;
    if (validArticles.length === 0) {
      setImportOutcome({ imported: 0, failed: invalidCount, message: "Tidak ada artikel valid untuk diimpor." });
      return;
    }

    setIsImporting(true);
    setImportError("");
    try {
      const updatedContent = { ...content, articles: appendImportedArticles(articles, validArticles) };
      const result = await saveToGitHub(updatedContent);
      if (!result.success) {
        setImportOutcome({
          imported: 0,
          failed: importRows.length,
          message: `Penyimpanan gagal. Tidak ada artikel yang ditambahkan ke CMS. ${result.message}`,
        });
        return;
      }

      updateContent(updatedContent);
      setSelectedId(validArticles[0].id);
      setEditedSlug(false);
      setImportOutcome({
        imported: validArticles.length,
        failed: invalidCount,
        message: result.message,
      });
    } catch (error) {
      setImportOutcome({
        imported: 0,
        failed: importRows.length,
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan artikel.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImportFile(file);
    setImportRows(null);
    setImportError("");
    setImportOutcome(null);
    event.target.value = "";
  };

  const updateArticle = (patch: Partial<Article>) => {
    if (!selectedArticle) return;
    updateContent({ ...content, articles: articles.map((article) => article.id === selectedId ? { ...article, ...patch } : article) });
  };

  const createArticle = () => {
    const article = blankArticle();
    updateContent({ ...content, articles: [article, ...articles] });
    setSelectedId(article.id);
    setEditedSlug(false);
  };

  const deleteArticle = (id: string) => {
    const remaining = articles.filter((article) => article.id !== id);
    updateContent({ ...content, articles: remaining });
    if (selectedId === id) setSelectedId(remaining[0]?.id || "");
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-serif font-bold text-[#dbae6b]">Artikel & SEO</h2><p className="mt-1 text-xs text-gray-400">Tulis artikel, simpan sebagai draft, lalu terbitkan ke website.</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openImport} className="flex items-center gap-2 rounded-lg border border-[#dbae6b]/40 bg-[#0b1728] px-4 py-2 text-xs font-bold text-[#dbae6b] hover:bg-[#dbae6b]/10"><FiUpload /> Import Artikel</button>
          <button onClick={createArticle} className="flex items-center gap-2 rounded-lg bg-[#dbae6b] px-4 py-2 text-xs font-bold text-[#002044]"><FiPlus /> Artikel Baru</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {articles.length ? articles.map((article) => (
            <button key={article.id} onClick={() => { setSelectedId(article.id); setEditedSlug(true); }} className={`w-full rounded-lg border p-4 text-left ${selectedId === article.id ? "border-[#dbae6b]/70 bg-[#dbae6b]/10" : "border-white/10 bg-[#0b1728] hover:border-white/25"}`}>
              <span className="block truncate text-sm font-semibold text-white">{article.title || "Artikel tanpa judul"}</span>
              <span className="mt-2 block text-[10px] uppercase tracking-widest text-gray-400">{article.status === "published" ? "Terbit" : "Draft"}</span>
            </button>
          )) : <p className="rounded-lg border border-white/10 p-5 text-sm text-gray-400">Belum ada artikel.</p>}
        </aside>

        {selectedArticle ? <section className="space-y-5 rounded-xl border border-[#dbae6b]/20 bg-[#0b1728] p-5 md:p-7">
          <div className="flex items-center justify-between gap-3"><h3 className="font-serif text-xl font-semibold text-white">Edit Artikel</h3><button onClick={() => deleteArticle(selectedArticle.id)} className="flex items-center gap-2 rounded border border-red-400/30 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"><FiTrash2 /> Hapus</button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Judul Artikel" value={selectedArticle.title} onChange={(title) => updateArticle({ title, ...(!editedSlug ? { slug: slugify(title) } : {}) })} />
            <Field label="Slug URL" value={selectedArticle.slug} onChange={(slug) => { setEditedSlug(true); updateArticle({ slug: slugify(slug) }); }} hint="URL artikel, contoh: tips-memilih-kitchen-set" />
            <Field label="Kategori" value={selectedArticle.category} onChange={(category) => updateArticle({ category })} />
            <Field label="Penulis" value={selectedArticle.author} onChange={(author) => updateArticle({ author })} />
            <Field label="Tanggal Publikasi" type="date" value={selectedArticle.publishedAt} onChange={(publishedAt) => updateArticle({ publishedAt })} />
            <label className="text-xs font-semibold text-[#dbae6b]">Status Artikel<select value={selectedArticle.status} onChange={(event) => updateArticle({ status: event.target.value as Article["status"] })} className="mt-2 w-full rounded border border-white/10 bg-[#07111e] px-3 py-3 text-sm text-white"><option value="draft">Draft</option><option value="published">Terbitkan</option></select></label>
            <div className="space-y-3"><ArticleCoverUploader value={selectedArticle.coverImage} onChange={(coverImage) => updateArticle({ coverImage })} /><Field label="Alt Text Gambar Sampul" value={selectedArticle.coverImageAlt || ""} onChange={(coverImageAlt) => updateArticle({ coverImageAlt })} hint="Jelaskan objek dan konteks visual secara spesifik. Contoh: Kitchen set custom berbentuk L dengan finishing kayu oak dan kabinet putih." /></div>
            <Field label="Focus Keyword (opsional)" value={selectedArticle.focusKeyword || ""} onChange={(focusKeyword) => updateArticle({ focusKeyword })} />
            <Field label="Judul SEO (opsional)" value={selectedArticle.seoTitle} onChange={(seoTitle) => updateArticle({ seoTitle })} />
          </div>
          <div className="rounded-lg border border-white/10 bg-[#07111e] p-4"><p className="text-xs font-semibold text-[#dbae6b]">Pemeriksaan SEO gambar</p><ul className="mt-2 space-y-1 text-xs text-gray-300"><li>{selectedArticle.coverImage ? (selectedArticle.coverImageAlt?.trim() ? "✓ Alt text gambar sampul sudah diisi." : "⚠ Gambar sampul belum memiliki alt text deskriptif.") : "• Belum ada gambar sampul."}</li><li>{(selectedArticle.body.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length} gambar inline terdeteksi; {(selectedArticle.body.match(/!\[\]\([^)]+\)/g) || []).length} di antaranya belum memiliki alt text.</li><li>Setiap gambar inline harus ditulis dengan format ![deskripsi gambar](URL).</li></ul></div>\n          <TextField label="Ringkasan Artikel" value={selectedArticle.excerpt} onChange={(excerpt) => updateArticle({ excerpt })} rows={3} hint="Tampil di daftar artikel dan hasil berbagi." />
          <ArticleInlineImageUploader onInsert={(markdown) => updateArticle({ body: `${selectedArticle.body.trim()}\n\n${markdown}\n` })} />
          <TextField label="Isi Artikel" value={selectedArticle.body} onChange={(body) => updateArticle({ body })} rows={16} hint="Gunakan ## untuk H2, ### untuk H3, paragraf dipisahkan baris kosong, - untuk daftar. Gambar dapat ditambahkan melalui uploader di atas atau dengan format ![alt text](URL). Setiap gambar wajib memiliki alt text deskriptif." />
          <TextField label="Deskripsi SEO (opsional)" value={selectedArticle.seoDescription} onChange={(seoDescription) => updateArticle({ seoDescription })} rows={3} hint="Jika kosong, ringkasan artikel digunakan." />
          <p className="border-t border-white/10 pt-4 text-xs leading-5 text-gray-400">Perubahan tersimpan di editor ini. Klik <strong className="text-[#dbae6b]">Simpan Ke GitHub</strong> di bagian atas untuk menyimpan konten CMS dan menerbitkan pembaruan.</p>
        </section> : <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-gray-400">Pilih artikel untuk mengedit, atau buat artikel baru.</div>}
      </div>

      {isImportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isImporting && !saving) setIsImportOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="article-import-title" className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-[#dbae6b]/30 bg-[#07111e] p-5 shadow-2xl md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="article-import-title" className="font-serif text-2xl font-bold text-[#dbae6b]">Import Artikel</h3>
                <p className="mt-2 text-sm text-gray-300">Pilih file JSON untuk meninjau beberapa artikel sekaligus. Artikel yang diimpor selalu berstatus Draft dan artikel lama tidak akan ditimpa.</p>
              </div>
              <FiFileText className="mt-1 shrink-0 text-xl text-[#dbae6b]" />
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-[#0b1728] p-4">
              <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isImporting || saving} className="rounded-lg border border-[#dbae6b]/40 px-4 py-2 text-xs font-semibold text-[#dbae6b] hover:bg-[#dbae6b]/10 disabled:opacity-50">Pilih File</button>
                <span className="text-xs text-gray-300">{importFile?.name || "Belum ada file dipilih"}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-400">Format: file .json berupa array artikel atau objek dengan properti <code className="text-[#dbae6b]">articles</code>. Setiap artikel menggunakan field CMS seperti title, slug, excerpt, category, coverImage, coverImageAlt, author, publishedAt, body, seoTitle, seoDescription, dan focusKeyword. Contoh lengkap tersedia di <code className="text-[#dbae6b]">examples/article-import-example.json</code>.</p>
            </div>

            {importError && <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-300">{importError}</p>}

            {importRows && (
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-950/30 px-3 py-1.5 text-emerald-300">Valid: {importRows.filter((row) => row.errors.length === 0).length}</span>
                  <span className="rounded-full border border-red-400/30 bg-red-950/30 px-3 py-1.5 text-red-300">Bermasalah: {importRows.filter((row) => row.errors.length > 0).length}</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
                    <thead className="bg-[#0b1728] text-[#dbae6b]"><tr>{["Judul", "Slug", "Kategori", "Focus keyword", "SEO title", "Meta description", "Status", "Validasi"].map((heading) => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}</tr></thead>
                    <tbody>
                      {importRows.map((row) => (
                        <tr key={`${row.index}-${row.article.id}`} className="border-t border-white/10 align-top">
                          <td className="max-w-48 px-3 py-3 text-white">{row.article.title || "—"}</td>
                          <td className="px-3 py-3 text-gray-300">{row.article.slug || "—"}</td>
                          <td className="px-3 py-3 text-gray-300">{row.article.category || "—"}</td>
                          <td className="px-3 py-3 text-gray-300">{row.article.focusKeyword || "—"}</td>
                          <td className="max-w-48 px-3 py-3 text-gray-300">{row.article.seoTitle || "—"}</td>
                          <td className="max-w-56 px-3 py-3 text-gray-300">{row.article.seoDescription || "—"}</td>
                          <td className="px-3 py-3 text-[#dbae6b]">Draft</td>
                          <td className="min-w-64 px-3 py-3">{row.errors.length ? <ul className="space-y-1 text-red-300">{row.errors.map((error) => <li key={error}>{error}</li>)}</ul> : <span className="text-emerald-300">Siap diimpor</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importOutcome && (
              <div role="status" className={`mt-4 rounded-lg border p-4 text-sm ${importOutcome.imported > 0 ? "border-emerald-400/30 bg-emerald-950/30 text-emerald-200" : "border-red-400/30 bg-red-950/30 text-red-200"}`}>
                <p className="font-semibold">Import berhasil: {importOutcome.imported} · Gagal: {importOutcome.failed}</p>
                <p className="mt-1">{importOutcome.message}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
              <button type="button" onClick={() => setIsImportOpen(false)} disabled={isImporting || saving} className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:bg-white/5 disabled:opacity-50">Batal</button>
              <button type="button" onClick={validateImportFile} disabled={!importFile || isValidating || isImporting || saving || Boolean(importOutcome)} className="flex items-center gap-2 rounded-lg border border-[#dbae6b]/40 px-4 py-2.5 text-xs font-semibold text-[#dbae6b] hover:bg-[#dbae6b]/10 disabled:opacity-50">{isValidating ? "Memvalidasi..." : "Validasi Artikel"}</button>
              {importRows && !importOutcome && importRows.some((row) => row.errors.length === 0) && <button type="button" onClick={importValidArticles} disabled={isImporting || saving} className="flex items-center gap-2 rounded-lg bg-[#dbae6b] px-4 py-2.5 text-xs font-bold text-[#002044] disabled:opacity-50">{isImporting || saving ? "Menyimpan..." : <><FiCheckCircle /> Import Artikel</>}</button>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="text-xs font-semibold text-[#dbae6b]">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-white/10 bg-[#07111e] px-3 py-3 text-sm font-normal text-white outline-none focus:border-[#dbae6b]/60" />{hint && <span className="mt-1 block font-normal text-gray-500">{hint}</span>}</label>;
}

function TextField({ label, value, onChange, rows, hint }: { label: string; value: string; onChange: (value: string) => void; rows: number; hint?: string }) {
  return <label className="block text-xs font-semibold text-[#dbae6b]">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-2 w-full resize-y rounded border border-white/10 bg-[#07111e] px-3 py-3 text-sm font-normal leading-6 text-white outline-none focus:border-[#dbae6b]/60" />{hint && <span className="mt-1 block font-normal text-gray-500">{hint}</span>}</label>;
}
