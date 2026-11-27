import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import MapSection from "@/components/MapSection";

export const metadata: Metadata = {
  title: "Kontak Hansen Projects",
  description:
    "Hubungi Hansen Projects untuk konsultasi desain interior dan custom furniture. Tim kami siap membantu kebutuhan proyek Anda.",
  alternates: {
    canonical: "/kontak",
  },
  openGraph: {
    title: "Kontak Hansen Projects",
    description:
      "Hubungi Hansen Projects untuk konsultasi desain interior dan custom furniture. Tim kami siap membantu kebutuhan proyek Anda.",
    url: "/kontak",
  },
};

export default function KontakPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-20">
        <ContactSection />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}
