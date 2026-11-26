"use client";

import { useContent } from "@/context/ContentContext";
import Image from "next/image";
import { FiGrid, FiAward, FiUsers } from "react-icons/fi";

export default function PortfolioIntro() {
  const { content } = useContent();
  const intro = content.portofolioPage.intro;

  return (
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
              {intro.badge || "Portfolio Kami"}
            </span>
            <div className="w-8 h-[2px] bg-primary"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 font-serif uppercase tracking-wide">
            {intro.titleLine1}
            <br />
            <span className="text-primary">{intro.titleLine2}</span>
          </h1>

          <p className="text-text-muted text-sm md:text-base max-w-2xl mb-10 leading-relaxed">
            {intro.description}
          </p>

          {/* 3 Key Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 w-full max-w-3xl">
            {intro.stats ? (
              intro.stats.map((st, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-sm shrink-0 font-bold font-serif text-lg">
                    {st.number}
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-200">
                    {st.label}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-sm shrink-0">
                    <FiGrid className="text-xl" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-200">
                    Berbagai Jenis Proyek
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-sm shrink-0">
                    <FiAward className="text-xl" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-200">
                    Hasil Berkualitas & Terpercaya
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-sm shrink-0">
                    <FiUsers className="text-xl" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-200">
                    Dipercaya oleh Banyak Klien
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
