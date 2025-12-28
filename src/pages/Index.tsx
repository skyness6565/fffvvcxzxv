import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import RatesSection from "@/components/RatesSection";
import MemberCareSection from "@/components/MemberCareSection";
import HelpSection from "@/components/HelpSection";
import PromoSection from "@/components/PromoSection";
import ArticlesSection from "@/components/ArticlesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import BottomBar from "@/components/BottomBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MissionSection />
        <RatesSection />
        <MemberCareSection />
        <HelpSection />
        <PromoSection />
        <ArticlesSection />
        <TestimonialsSection />
        <AboutSection />
      </main>
      <Footer />
      <BottomBar />
    </div>
  );
};

export default Index;
