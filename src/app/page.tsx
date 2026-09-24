import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  AboutSection,
  InitiativesSection,
  PillarsSection,
  WhoWeAreSection,
} from "@/features/landing/components/content-sections";
import { HeroSection } from "@/features/landing/components/hero-section";
import { JourneySection } from "@/features/landing/components/journey-section";
import { PledgeDialogProvider } from "@/features/pledge/components/pledge-dialog-provider";

export default function HomePage() {
  return (
    <PledgeDialogProvider>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <HeroSection />
        <AboutSection />
        <WhoWeAreSection />
        <PillarsSection />
        <InitiativesSection />
        <JourneySection />
      </main>
      <SiteFooter />
    </PledgeDialogProvider>
  );
}
