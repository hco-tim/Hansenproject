import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/getContent";

// The sitemap changes only when CMS content changes; it is invalidated on CMS save.
export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hansenprojects.id";
  const content = await getSiteContent();
  const articles = (content.articles || []).filter((article) => article.status === "published");

  return [
    {
      url: `${baseUrl}`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/layanan`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portofolio`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/artikel`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/artikel/${article.slug}`,
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
