"use client";

import { useContent } from "@/context/ContentContext";
import Image from "next/image";

export default function Services() {
  const { content } = useContent();
  const services = content.home.services;

  return (
    <section className="bg-white text-gray-900 py-20" id="layanan">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl md:text-4xl font-bold font-serif uppercase tracking-wide text-[#002044]">
                {services.title}
              </h2>
              <div className="w-16 h-[2px] bg-primary"></div>
            </div>
            <p className="text-gray-600 text-sm max-w-xl">
              {services.subtitle}
            </p>
          </div>
          <a
            href="/layanan"
            className="text-[#002044] hover:text-primary font-medium text-sm flex items-center gap-2 transition-colors font-bold"
          >
            {services.viewAllText || "Lihat Semua Layanan"} <span>&rarr;</span>
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.items.map((service, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col rounded-sm overflow-hidden"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <Image
                  src={service.image || "/services/interior.jpg"}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={75}
                  unoptimized={service.image?.startsWith("data:") || service.image?.startsWith("http://") || service.image?.startsWith("https://")}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold font-serif text-[#002044] mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 flex-1">
                  {service.description}
                </p>
                <a
                  href={service.link || "/layanan"}
                  className="text-xs font-bold text-[#002044] group-hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-wide"
                >
                  PELAJARI LEBIH LANJUT <span>&rarr;</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
