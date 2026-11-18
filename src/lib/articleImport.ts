import type { Article } from "@/data/initialContent";

export type ArticleImportRow = {
  index: number;
  article: Article;
  errors: string[];
};

const articleTextFields = [
  "title",
  "excerpt",
  "category",
  "coverImage",
  "author",
  "publishedAt",
  "body",
  "seoTitle",
  "seoDescription",
  "focusKeyword",
] as const;

const allowedFields = new Set<string>(["id", "slug", "status", ...articleTextFields]);

const slugify = (value: string) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function previewArticleImport(data: unknown, existingArticles: Article[]): ArticleImportRow[] {
  const records = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.articles)
      ? data.articles
      : null;

  if (!records) {
    throw new Error("Format JSON tidak valid. Gunakan array artikel atau objek dengan properti articles berupa array.");
  }
  if (records.length === 0) {
    throw new Error("File JSON belum berisi artikel.");
  }

  const usedSlugs = new Set(
    existingArticles.map((article) => slugify(article.slug)).filter(Boolean),
  );

  return records.map((record, index) => {
    const errors: string[] = [];
    if (!isRecord(record)) {
      return {
        index,
        article: emptyArticle(),
        errors: ["Data artikel harus berupa objek JSON."],
      };
    }

    for (const field of Object.keys(record)) {
      if (!allowedFields.has(field)) errors.push(`Field "${field}" tidak dikenal.`);
    }

    const values: Record<string, string> = {
      title: "",
      excerpt: "",
      category: "Inspirasi Interior",
      coverImage: "",
      author: "Hansen Projects",
      publishedAt: new Date().toISOString().slice(0, 10),
      body: "",
      seoTitle: "",
      seoDescription: "",
      focusKeyword: "",
    };

    for (const field of articleTextFields) {
      const value = record[field];
      if (value === undefined) continue;
      if (typeof value !== "string") {
        errors.push(`Field "${field}" harus berupa teks.`);
      } else {
        values[field] = value.trim();
      }
    }

    if (!values.title) errors.push("Judul artikel wajib diisi.");

    const rawSlug = record.slug;
    let slug = "";
    if (typeof rawSlug !== "string" || !rawSlug.trim()) {
      errors.push("Slug artikel wajib diisi.");
    } else {
      slug = slugify(rawSlug.trim());
      if (!slug) errors.push("Slug tidak memiliki karakter yang dapat digunakan.");
      else if (usedSlugs.has(slug)) errors.push(`Slug "${slug}" sudah digunakan artikel lain.`);
    }

    const article: Article = {
      id: crypto.randomUUID(),
      title: values.title,
      slug,
      excerpt: values.excerpt,
      category: values.category,
      coverImage: values.coverImage,
      author: values.author,
      publishedAt: values.publishedAt,
      status: "draft",
      body: values.body,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
      focusKeyword: values.focusKeyword,
    };

    if (errors.length === 0) usedSlugs.add(slug);
    return { index, article, errors };
  });
}

export function appendImportedArticles(existingArticles: Article[], importedArticles: Article[]): Article[] {
  const usedSlugs = new Set(existingArticles.map((article) => slugify(article.slug)).filter(Boolean));
  for (const article of importedArticles) {
    const slug = slugify(article.slug);
    if (!slug || usedSlugs.has(slug)) {
      throw new Error(`Slug "${article.slug}" sudah digunakan. Validasi ulang file sebelum mengimpor.`);
    }
    usedSlugs.add(slug);
  }
  return [...importedArticles, ...existingArticles];
}

function emptyArticle(): Article {
  return {
    id: crypto.randomUUID(),
    title: "",
    slug: "",
    excerpt: "",
    category: "",
    coverImage: "",
    author: "",
    publishedAt: "",
    status: "draft",
    body: "",
    seoTitle: "",
    seoDescription: "",
    focusKeyword: "",
  };
}
