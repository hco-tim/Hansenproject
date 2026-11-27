interface FAQItem {
  question: string;
  answer: string;
}

interface StructuredDataProps {
  type?: "business" | "faq" | "all";
  faqItems?: FAQItem[];
}

export default function StructuredData({
  type = "all",
  faqItems = [],
}: StructuredDataProps) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.hansenprojects.id"
  ).replace(/\/$/, "");

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${baseUrl}/#business`,
    name: "Hansen Projects",
    alternateName: "Hansen Projects - Desain Interior & Custom Furniture",
    url: baseUrl,
    logo: `${baseUrl}/logo-hansen.png`,
    image: `${baseUrl}/background.jpg`,
    description:
      "Layanan custom furniture dan interior untuk hunian, apartemen, perkantoran, dan kebutuhan komersial.",
    telephone: "+6281315163886",
    email: "marketing@hco.co.id",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Kayu Putih No. 81, Pondok Cabe Udik",
      addressLocality: "Pamulang, Tangerang Selatan",
      addressRegion: "Banten",
      addressCountry: "ID",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+6281315163886",
      email: "marketing@hco.co.id",
      contactType: "customer service",
      availableLanguage: ["Indonesian"],
    },
    sameAs: ["https://www.instagram.com/hansenprojects/"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Hansen Projects",
    description: "Desain interior dan custom furniture Hansen Projects.",
    inLanguage: "id-ID",
    publisher: { "@id": `${baseUrl}/#business` },
  };

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
            dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
        </>
      )}
      {(type === "all" || type === "faq") && faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
