import type { Metadata } from "next";
import { Cormorant, Poppins } from "next/font/google";
import "./globals.css";
import { ContentProvider } from "@/context/ContentContext";
import StructuredData from "@/components/StructuredData";
import WhatsAppButton from "@/components/WhatsAppButton";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.hansenprojects.id"),
  title: {
    default: "Hansen Projects | Desain Interior & Custom Furniture Berkualitas",
    template: "%s | Hansen Projects",
  },
  description:
    "Wujudkan ruang impian Anda bersama Hansen Projects. Jasa desain interior & custom furniture profesional untuk rumah, apartemen, kantor, dan komersial dengan material premium dan pengerjaan presisi.",
  keywords: [
    "hansen projects",
    "desain interior",
    "jasa desain interior",
    "custom furniture",
    "kontraktor interior",
    "kitchen set custom",
    "interior rumah",
    "interior kantor",
    "interior apartemen",
    "fit out interior",
    "renovasi interior jakarta",
    "furniture minimalis",
  ],
  authors: [{ name: "Hansen Projects" }],
  creator: "Hansen Projects",
  publisher: "Hansen Projects",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hansen Projects | Desain Interior & Custom Furniture Berkualitas",
    description:
      "Wujudkan ruang impian Anda bersama Hansen Projects. Solusi interior dan custom furniture premium dengan pengerjaan profesional dan bergaransi.",
    url: "/",
    siteName: "Hansen Projects",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/background.jpg",
        width: 1200,
        height: 630,
        alt: "Hansen Projects - Desain Interior & Build",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hansen Projects | Desain Interior & Custom Furniture Berkualitas",
    description:
      "Wujudkan ruang impian Anda bersama Hansen Projects. Solusi interior dan custom furniture premium dengan pengerjaan profesional.",
    images: ["/background.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

import { getSiteContent } from "@/lib/getContent";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();
  const publicContent = {
    ...content,
    // Public pages need article metadata only. Full article bodies are fetched
    // by the article route and loaded separately by the authenticated CMS.
    articles: (content.articles || [])
      .filter((article) => article.status === "published")
      .map((article) => ({ ...article, body: "" })),
  };

  return (
    <html lang="id" className={`${cormorant.variable} ${poppins.variable} h-full antialiased`}>
      <head>
        <StructuredData type="all" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ContentProvider initialData={publicContent}>
          {children}
          <WhatsAppButton />
        </ContentProvider>
      </body>
    </html>
  );
}

