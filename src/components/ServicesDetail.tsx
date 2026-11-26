"use client";

import { useContent } from "@/context/ContentContext";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

export default function ServicesDetail() {
  const { content } = useContent();
  const detail = content.layananPage.servicesDetail;

  return (
    <section className="bg-white text-gray-900 py-20" id="daftar-layanan">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold tracking-widest text-[#002044] uppercase">
                {detail.badge || "LAYANAN"}
              </span>
              <div className="w-12 h-[2px] bg-[#dbae6b]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#002044]">
              {detail.title}
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl">
              {detail.description}
            </p>
          </div>

          <a
            href="#kontak-kami"
            className="text-[#002044] hover:text-[#dbae6b] font-medium text-sm flex items-center gap-2 transition-colors shrink-0 group font-bold"
          >
            Konsultasikan Kebutuhan Anda
            <FiArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {detail.items.map((service, idx) => (
            <div key={idx} className="flex flex-col group">
              {/* Card Image */}
              <div className="relative h-60 md:h-64 w-full overflow-hidden rounded-sm mb-6 bg-gray-100">
                <Image
                  src={service.image || "/services/furniture.jpg"}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={75}
                  unoptimized={service.image?.startsWith("data:") || service.image?.startsWith("http://") || service.image?.startsWith("https://")}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Card Content with Number */}
              <div className="flex items-start gap-4 relative flex-1">
                <span className="text-3xl lg:text-4xl font-serif font-bold text-[#dbae6b] leading-none shrink-0 pt-0.5">
                  {service.number}
                </span>

                <div className="flex-1 pr-6">
                  <h3 className="text-xl font-serif font-bold text-[#002044] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <a
                  href="#kontak-kami"
                  aria-label={`Detail ${service.title}`}
                  className="text-[#002044] hover:text-[#dbae6b] transition-colors absolute bottom-0 right-0 p-1"
                >
                  <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
