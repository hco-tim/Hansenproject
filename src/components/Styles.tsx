"use client";

import { useContent } from "@/context/ContentContext";
import Image from "next/image";

export default function Styles() {
  const { content } = useContent();
  const styles = content.home.styles;

  return (
    <section className="bg-white text-gray-900 py-20" id="gaya">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl md:text-4xl font-bold font-serif uppercase tracking-wide text-[#002044]">
                {styles.title}
              </h2>
              <div className="w-16 h-[2px] bg-primary"></div>
            </div>
            <p className="text-gray-600 text-sm max-w-xl">
              {styles.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {styles.items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col rounded-sm overflow-hidden"
            >
              <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                <Image
                  src={item.image || "/styles/minimalist.jpg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={75}
                  unoptimized={item.image?.startsWith("data:") || item.image?.startsWith("http://") || item.image?.startsWith("https://")}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold font-serif text-[#002044] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
