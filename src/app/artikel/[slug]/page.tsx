import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleBody from "@/components/ArticleBody";
import { getSiteContent } from "@/lib/getContent";

type Props = { params: Promise<{ slug: string }> };

async function getPublishedArticle(slug: string) {
  const content = await getSiteContent();
  return (content.articles || []).find((article) => article.slug === slug && article.status === "published");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  const description = article.seoDescription || article.excerpt;
  return {
    title: article.seoTitle || article.title,
    description,
    alternates: { canonical: `/artikel/${article.slug}` },
    openGraph: { type: "article", title: article.seoTitle || article.title, description, images: article.coverImage ? [article.coverImage] : undefined, publishedTime: article.publishedAt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();
  const publishedDate = new Date(`${article.publishedAt}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <article className="px-6 pb-20 pt-36 md:px-10 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <Link href="/artikel" className="text-xs uppercase tracking-[0.2em] text-primary hover:text-white">← Semua artikel</Link>
          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-primary">{article.category || "Inspirasi"} · {publishedDate} · {article.author || "Hansen Projects"}</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight md:text-6xl">{article.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{article.excerpt}</p>
          {article.coverImage && <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-slate-800"><Image src={article.coverImage} alt={article.title} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" unoptimized={article.coverImage.startsWith("data:") || /^https?:\\/\\//.test(article.coverImage)} /></div>}
          <div className="mx-auto mt-10 max-w-3xl"><ArticleBody body={article.body} /></div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
