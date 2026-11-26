import React from "react";
import { initialContent } from "@/data/initialContent";

interface StructuredDataProps {
  type?: "business" | "faq" | "all";
}

export default function StructuredData({ type = "all" }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hansenprojects.id";

  // Business & Organization Schema
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${baseUrl}/#organization`,
    name: "Hansen Projects",
    alternateName: "Hansen Projects - Desain Interior & Custom Furniture",
    url: baseUrl,
    logo: `${baseUrl}/logo-hansen.png`,
    image: `${baseUrl}/background.jpg`,
    description:
      "Jasa desain interior profesional dan custom furniture untuk hunian, apartemen, perkantoran, dan komersial.",
    telephone: initialContent.footer.phone || "+62 812 3456 7890",
    email: initialContent.footer.email || "hello@hansenprojects.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressRegion: "DKI Jakarta",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.2088,
      longitude: 106.8456,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    sameAs: [
      `https://instagram.com/${(initialContent.footer.instagram || "hansenprojects").replace("@", "")}`,
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Layanan Hansen Projects",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Desain Interior",
            description: "Konsep, perencanaan, dan pengembangan 3D desain interior detail.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Desain & Konstruksi / Fit Out",
            description: "Pelaksanaan pembangunan dan renovasi interior ruang komersial & residensial.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Furniture & Kitchen Set",
            description: "Pembuatan furniture kustom presisi tinggi dan kitchen set mewah.",
          },
        },
      ],
    },
  };

  // WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Hansen Projects",
    description: "Desain Interior & Build - Wujudkan ruang impian Anda.",
    inLanguage: "id-ID",
  };

  // FAQPage Schema
  const faqItems = initialContent.home.faq.items || [];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {(type === "all" || type === "business") && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(businessSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteSchema),
            }}
          />
        </>
      )}
      {(type === "all" || type === "faq") && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
    </>
  );
}
