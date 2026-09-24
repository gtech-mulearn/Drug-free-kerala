import Image from "next/image";
import logo from "@/assets/images/logo-drug-free-kerala.png";
import { Container } from "@/components/ui/layout";
import { HeaderShell } from "./header-shell";
import { MobileNav } from "./mobile-nav";
import { PartnerLogos } from "./partner-logos";

export function SiteHeader() {
  return (
    <HeaderShell>
      <Container className="flex h-header items-center justify-between gap-4">
        <a href="#top" className="flex shrink-0 items-center rounded-md">
          <Image src={logo} alt="Drug Free Kerala: home" priority className="h-10 w-auto" sizes="140px" />
        </a>
        <div className="flex items-center gap-3 sm:gap-6">
          <PartnerLogos />
          <span aria-hidden="true" className="h-8 w-px bg-foreground/20" />
          <MobileNav />
        </div>
      </Container>
    </HeaderShell>
  );
}
