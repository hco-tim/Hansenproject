import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CMS Nonaktif",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-serif text-3xl font-semibold">CMS Hansen Projects tidak aktif</h1>
        <p className="mt-4 text-slate-300">Pembaruan konten website saat ini dilakukan melalui repository GitHub dan deployment.</p>
        <Link href="/" className="mt-8 inline-block text-primary underline">Kembali ke website</Link>
      </div>
    </main>
  );
}
