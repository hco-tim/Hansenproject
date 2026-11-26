"use client";

import { useContent } from "@/context/ContentContext";
import Image from "next/image";

export default function ServicesIntro() {
  const { content } = useContent();
  const intro = content.layananPage.intro;

  return (
    <div className="relative min-h-[80vh] flex flex-col overflow-hidden bg-background text-foreground pt-24 pb-16 lg:py-0">
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
        <div className="absolute inset-0 bg-gradient-to-r from-background from-30% via-background/50 via-65% to-transparent to-90%" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 flex-1 grid lg:grid-cols-12 gap-8 items-center h-full pt-12 lg:pt-20">
        <div className="lg:col-span-7 flex flex-col items-start">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-text-muted font-base tracking-widest text-xs lg:text-sm uppercase font-bold">
              {intro.badge || "Layanan Kami"}
            </span>
            <div className="w-8 h-[2px] bg-primary"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5 font-serif tracking-wide">
            {intro.titleLine1}
            <br />
            <span className="text-primary">{intro.titleLine2}</span>
          </h1>

          <p className="text-text-muted text-sm md:text-base max-w-xl mb-8 leading-relaxed">
            {intro.description}
          </p>
        </div>
      </div>
    </div>
  );
}
