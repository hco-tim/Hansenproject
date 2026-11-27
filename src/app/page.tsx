import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Styles from "@/components/Styles";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import Locations from "@/components/Locations";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ServicesParallax from "@/components/ServicesParallax";
import ContactSection from "@/components/ContactSection";
import MapSection from "@/components/MapSection";
import StructuredData from "@/components/StructuredData";
import { getSiteContent } from "@/lib/getContent";

export default async function Home() {
  const content = await getSiteContent();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
      <StructuredData type="faq" faqItems={content.home.faq.items} />
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <Styles />
      <Projects />
      <Locations />
      <Testimonials />
      <FAQ />
      <ServicesParallax />
      <ContactSection />
      <MapSection />
      <CTA />
      <Footer />
    </div>
  );
}
