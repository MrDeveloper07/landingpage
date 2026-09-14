import React from "react";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import ShowcaseSection from "@/components/sections/ShowcaseSection";
import CtaSection from "@/components/sections/CtaSection";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative flex flex-col min-h-screen overflow-x-hidden bg-[#fafafa]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
