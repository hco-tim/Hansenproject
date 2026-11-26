"use client";

import { useContent } from "@/context/ContentContext";
import Image from "next/image";
import {
  FiUsers,
  FiShield,
} from "react-icons/fi";
import { IoDiamondOutline } from "react-icons/io5";

export default function Hero() {
  const { content } = useContent();
  const hero = content.home.hero;

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {hero.bgImage && (
          <Image
            src={hero.bgImage}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={75}
            unoptimized={hero.bgImage.startsWith("data:") || hero.bgImage.startsWith("http://") || hero.bgImage.startsWith("https://")}
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background from-30% via-background/40 via-65% to-transparent to-90%" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 flex-1 grid lg:grid-cols-12 gap-8 items-center h-full pt-20 lg:pt-0">
        {/* Left Column - Text Content */}
        <div className="lg:col-span-8 flex flex-col items-start">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-text-muted font-base tracking-widest text-xs lg:text-sm uppercase">
              {hero.badge}
            </span>
            <div className="w-8 h-[2px] bg-primary"></div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-5 font-serif uppercase tracking-wide whitespace-pre-line">
            {hero.title}
          </h1>

          <p className="text-text-muted text-sm max-w-lg mb-8 leading-relaxed">
            {hero.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-10">
            <a
              href={hero.ctaPrimaryLink || "#kontak-kami"}
              className="flex items-center gap-2 bg-primary text-background px-6 py-3 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              {hero.ctaPrimaryText} <span>&rarr;</span>
            </a>
            <a
              href={hero.ctaSecondaryLink || "/portofolio"}
              className="flex items-center gap-2 border border-primary text-foreground hover:bg-primary hover:text-background px-6 py-3 font-bold text-xs transition-colors"
            >
              {hero.ctaSecondaryText} <span>&rarr;</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 lg:gap-10 text-xs font-medium">
            {hero.features && hero.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {idx === 0 && <IoDiamondOutline className="text-2xl text-primary" />}
                {idx === 1 && <FiUsers className="text-2xl text-primary" />}
                {idx >= 2 && <FiShield className="text-2xl text-primary" />}
                <span className="leading-tight uppercase font-bold">
                  {feat.title}
                  <br />
                  {feat.subtitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
