"use client";

import { useContent } from "@/context/ContentContext";
import Image from "next/image";

export default function AboutIntro() {
  const { content } = useContent();
  const intro = content.tentangKamiPage.intro;

  return (
    <>
      {/* Hero Header Section */}
      <div className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden bg-background text-foreground pt-28 pb-16 lg:py-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {intro.bgImage && (
            <Image
              src={intro.bgImage}
              alt=""
              fill
              priority
              sizes="100vw"
              quality={75}
              unoptimized={intro.bgImage.startsWith("data:") || intro.bgImage.startsWith("http://") || intro.bgImage.startsWith("https://")}
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background from-30% via-background/60 via-65% to-transparent to-90%" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 flex-1 grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-8 flex flex-col items-start">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-text-muted font-base tracking-widest text-xs lg:text-sm uppercase font-bold">
                {intro.badge || "Tentang Kami"}
              </span>
              <div className="w-8 h-[2px] bg-primary"></div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 font-serif tracking-wide">
              {intro.titleLine1}
              <br />
              <span className="text-primary">{intro.titleLine2}</span>
            </h1>

            <p className="text-text-muted text-sm md:text-base max-w-2xl mb-8 leading-relaxed">
              {intro.description}
            </p>
          </div>
        </div>
      </div>

      {/* Siapa Kami Section */}
      <section className="bg-white text-gray-900 py-20" id="siapa-kami">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="relative h-[250px] lg:h-[420px] w-full shadow-lg overflow-hidden rounded-sm bg-gray-100">
            <Image
              src={intro.whoWeAreImage || "/services/interior.jpg"}
              alt={intro.whoWeAreTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={75}
              unoptimized={intro.whoWeAreImage?.startsWith("data:") || intro.whoWeAreImage?.startsWith("http://") || intro.whoWeAreImage?.startsWith("https://")}
              className="object-cover"
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <h4 className="text-[#002044] font-bold text-xs tracking-widest uppercase">
                {intro.whoWeAreBadge || "SIAPA KAMI"}
              </h4>
              <div className="w-16 h-[2px] bg-[#dbae6b]"></div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold font-serif uppercase tracking-wide text-[#002044] mb-6">
              {intro.whoWeAreTitle}
            </h2>

            <div className="space-y-5 text-gray-600 text-sm md:text-base leading-relaxed">
              <p>{intro.whoWeAreParagraph1}</p>
              <p>{intro.whoWeAreParagraph2}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
