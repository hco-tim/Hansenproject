import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_URL =
  "https://wa.me/6281315163886?text=Halo%20Hansen%20Projects%2C%20saya%20ingin%20konsultasi%20mengenai%20interior%20dan%20custom%20furniture.";

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi Hansen Projects melalui WhatsApp"
      title="Hubungi Hansen Projects melalui WhatsApp"
      className="fixed bottom-6 right-5 z-[60] inline-flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-white/80 bg-[#25D366] p-0 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#1FBD5B] hover:shadow-[0_12px_28px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 sm:bottom-7 sm:right-7 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3.5"
    >
      <FaWhatsapp aria-hidden="true" className="h-9 w-9 shrink-0 sm:h-6 sm:w-6" />
      <span className="hidden sm:inline">Konsultasi via WhatsApp</span>
    </a>
  );
}
