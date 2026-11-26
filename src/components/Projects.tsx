"use client";

import { useState } from "react";
import Image from "next/image";
import { useContent } from "@/context/ContentContext";
import { FiArrowRight } from "react-icons/fi";

export default function Projects() {
  const { content } = useContent();
  const projectsData = content.home.projects;
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const filteredItems = selectedCategory === "Semua"
    ? projectsData.items
    : projectsData.items.filter(item => item.category === selectedCategory);

  return (
    <section className="bg-[#f9fafb] text-gray-900 py-20" id="proyek">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl md:text-4xl font-bold font-serif uppercase tracking-wide text-[#002044]">
                {projectsData.title}
              </h2>
              <div className="w-16 h-[2px] bg-primary"></div>
            </div>
            <p className="text-gray-600 text-sm max-w-xl">
              {projectsData.subtitle}
            </p>
          </div>
          <a
            href="/portofolio"
            className="text-[#002044] hover:text-primary font-medium text-sm flex items-center gap-2 transition-colors font-bold"
          >
            Lihat Semua Proyek <span>&rarr;</span>
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-200 pb-1">
          {projectsData.categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-2.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-[#dbae6b] text-white shadow-sm font-bold"
                  : "bg-white text-gray-600 hover:text-[#002044] border border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((project, index) => (
            <a
              key={index}
              href="/portofolio"
              className="group relative h-[320px] lg:h-[400px] w-full overflow-hidden shadow-sm cursor-pointer block rounded-sm"
            >
              <Image
                src={project.image || "/projects/residential.jpg"}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                quality={75}
                unoptimized={project.image?.startsWith("data:") || project.image?.startsWith("http://") || project.image?.startsWith("https://")}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient Overlay bottom to top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#002044]/90 via-[#002044]/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div>
                  <h3 className="text-white font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {project.location}
                  </p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center text-white border border-white/30 rounded-full group-hover:bg-primary group-hover:border-primary group-hover:text-[#002044] transition-all duration-300">
                  <FiArrowRight />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
