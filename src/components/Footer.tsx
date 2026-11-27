"use client";

import Link from "next/link";
import { useContent } from "@/context/ContentContext";
import { FiPhone, FiMail, FiMapPin, FiInstagram } from "react-icons/fi";

export default function Footer() {
  const { content } = useContent();
  const footer = content.footer;
  const branding = content.branding;

  return (
    <footer className="bg-[#001730] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src={branding.logoUrl || "/logo-hansen.png"}
                alt="Logo"
                className="h-9 w-auto object-contain brightness-0 invert"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-widest text-[#dbae6b] uppercase leading-none font-serif">
                  {branding.siteName}
                </span>
                <span className="text-[10px] tracking-[0.3em] text-gray-300 uppercase mt-1">
                  {branding.siteTagline}
                </span>
              </div>
            </Link>

            <p className="text-xs text-gray-300 leading-relaxed">
              {footer.aboutText}
            </p>

            <div className="flex items-center gap-3 text-sm text-[#dbae6b]">
              <a
                href={`https://instagram.com/${footer.instagram?.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <FiInstagram className="text-lg" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#dbae6b]">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#dbae6b] transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang-kami"
                  className="hover:text-[#dbae6b] transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/layanan"
                  className="hover:text-[#dbae6b] transition-colors"
                >
                  Layanan Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/portofolio"
                  className="hover:text-[#dbae6b] transition-colors"
                >
                  Portofolio Proyek
                </Link>
              </li>
              <li>
                <Link
                  href="/kontak#kontak-kami"
                  className="hover:text-[#dbae6b] transition-colors"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#dbae6b]">
              Layanan Utama
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>Custom Kitchen Set</li>
              <li>Desain Interior Residensial</li>
              <li>Fit Out Perkantoran</li>
              <li>Interior Komersial & Retail</li>
              <li>Hospitality & Cafe</li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#dbae6b]">
              Hubungi Kami
            </h4>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-center gap-2.5">
                <FiPhone className="text-[#dbae6b] text-sm shrink-0" />
                <span>{footer.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiMail className="text-[#dbae6b] text-sm shrink-0" />
                <span>{footer.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <FiMapPin className="text-[#dbae6b] text-sm shrink-0 mt-0.5" />
                <span>{footer.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-4">
          <p>{footer.copyrightText}</p>
          {/* <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-[#dbae6b] transition-colors">
              Admin CMS Panel
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
