import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import AgentsSection from "@/components/landing/agents-section";
import DigitalSelfSection from "@/components/landing/digital-self-section";
import HowItWorks from "@/components/landing/how-it-works";
import CtaSection from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AgentsSection />
        <DigitalSelfSection />
        <HowItWorks />
        <CtaSection />
      </main>
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Nexus AI — Human Evolution Operating System
          </p>
          <p className="text-sm text-muted">&copy; {new Date().getFullYear()} Nexus AI</p>
        </div>
      </footer>
    </>
  );
}
