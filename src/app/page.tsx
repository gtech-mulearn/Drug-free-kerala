import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AboutSection } from "@/features/landing/components/about-section";
import { InitiativesSection } from "@/features/landing/components/initiatives-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { JourneySection } from "@/features/landing/components/journey-section";
import { PartnersBand } from "@/features/landing/components/partners-band";
import { PillarsSection } from "@/features/landing/components/pillars-section";
import { Preloader } from "@/features/landing/components/preloader";
import { PledgeBand } from "@/features/landing/components/pledge-band";
import { PledgeDialogProvider } from "@/features/pledge/components/pledge-dialog-provider";

export default function HomePage() {
  return (
    <PledgeDialogProvider>
      <Preloader />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <HeroSection />
        <AboutSection />
        <PartnersBand />
        <PillarsSection />
        <InitiativesSection />
        <JourneySection />
        <PledgeBand />
      </main>
      <SiteFooter />
    </PledgeDialogProvider>
  );
}
