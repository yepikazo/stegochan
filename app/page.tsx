import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <HowItWorksSection />
    </main>
  );
}
