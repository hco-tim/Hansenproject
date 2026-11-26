"use client";

import { useState } from "react";
import Image from "next/image";
import { useContent } from "@/context/ContentContext";
import { FiArrowRight, FiMapPin } from "react-icons/fi";

export default function PortfolioGallery() {
  const { content } = useContent();
  const gallery = content.portofolioPage.gallery;
  const [activeTab, setActiveTab] = useState("all");

  const filteredItems =
    activeTab === "all"
      ? gallery.items
      : gallery.items.filter((item) => item.category === activeTab);

  return (
    <section className="bg-white text-gray-900 py-20" id="kategori-proyek">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold tracking-widest text-[#002044] uppercase">
                {gallery.badge || "KATEGORI PROYEK"}
              </span>
              <div className="w-12 h-[2px] bg-[#dbae6b]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#002044]">
              {gallery.title}
            </h2>
          </div>

          <p className="text-gray-600 text-xs md:text-sm max-w-md leading-relaxed shrink-0">
            {gallery.subtitle}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-12 border-b border-gray-100 pb-4">
          {gallery.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-sm ${
                activeTab === cat.id
                  ? "bg-[#002044] text-[#dbae6b] shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="group relative h-[360px] lg:h-[420px] w-full overflow-hidden rounded-sm shadow-sm cursor-pointer flex flex-col justify-end"
            >
              <Image
                src={item.image || "/projects/residential.jpg"}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                quality={75}
                unoptimized={item.image?.startsWith("data:") || item.image?.startsWith("http://") || item.image?.startsWith("https://")}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#002044]/95 via-[#002044]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>

              {/* Card Content */}
              <div className="relative z-10 p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#dbae6b] bg-[#002044]/80 px-2.5 py-1 rounded-sm border border-[#dbae6b]/30">
                  {item.type}
                </span>

                <h3 className="text-xl font-serif font-bold text-white mt-3 mb-1 group-hover:text-[#dbae6b] transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-gray-300 mt-2">
                  <span className="flex items-center gap-1">
                    <FiMapPin className="text-[#dbae6b]" /> {item.location}
                  </span>
                  <a
                    href="#kontak-kami"
                    className="w-8 h-8 rounded-full bg-[#dbae6b] text-[#002044] flex items-center justify-center hover:bg-white transition-colors"
                    aria-label={`Konsultasi ${item.title}`}
                  >
                    <FiArrowRight className="text-sm" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
