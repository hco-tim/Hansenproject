import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/getContent";

export const metadata: Metadata = {
  title: "Artikel & Inspirasi Interior",
  description: "Temukan panduan, inspirasi, dan tips desain interior serta custom furniture dari Hansen Projects.",
  alternates: { canonical: "/artikel" },
};

export default async function ArticlesPage() {
  const content = await getSiteContent();
  const articles = (content.articles || []).filter((article) => article.status === "published").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="px-6 pb-20 pt-36 md:px-10 md:pt-44">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Jurnal Hansen Projects</p>
          <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight md:text-7xl">Artikel & Inspirasi Interior</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">Panduan praktis untuk merancang ruang yang nyaman, fungsional, dan sesuai kebutuhan Anda.</p>
          {articles.length ? (
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id} className="overflow-hidden border border-white/10 bg-white/[0.03]">
                  <Link href={`/artikel/${article.slug}`} className="group block">
                    {article.coverImage ? <div className="relative aspect-[16/10] bg-slate-800"><Image src={article.coverImage} alt={article.coverImageAlt?.trim() || article.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized={article.coverImage.startsWith("data:") || article.coverImage.startsWith("http://") || article.coverImage.startsWith("https://")} /></div> : <div className="aspect-[16/10] bg-gradient-to-br from-[#17395c] to-[#081526]" />}
                    <div className="p-6">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{article.category || "Inspirasi"} · {new Date(`${article.publishedAt}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                      <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug group-hover:text-primary">{article.title}</h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{article.excerpt}</p>
                      <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-wider text-primary">Baca artikel →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : <p className="mt-12 border border-white/10 p-8 text-slate-300">Artikel terbaru akan segera hadir.</p>}
        </div>
      </section>
      <Footer />
    </main>
  );
}
