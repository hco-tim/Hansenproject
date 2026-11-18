import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/getContent";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hansenprojects.id";
  const currentDate = new Date().toISOString();
  const content = await getSiteContent();
  const articles = (content.articles || []).filter((article) => article.status === "published");

  return [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/layanan`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portofolio`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/artikel`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/artikel/${article.slug}`,
      lastModified: article.publishedAt || currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: article.coverImage && !article.coverImage.startsWith("data:")
        ? [article.coverImage.startsWith("http://") || article.coverImage.startsWith("https://")
            ? article.coverImage
            : `${baseUrl}${article.coverImage.startsWith("/") ? "" : "/"}${article.coverImage}`]
        : undefined,
    })),
  ];
}
