import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/layout";
import { siteConfig } from "@/config/site";
import { PledgeDialogTrigger } from "@/features/pledge/components/pledge-dialog-trigger";
import { HeaderShell } from "./header-shell";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <HeaderShell>
      <Container className="flex h-header items-center justify-between gap-6">
        <a href="#top" aria-label="Drug Free Kerala: home" className="shrink-0 rounded-md">
          <Logo decorative className="h-10 sm:h-11" />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.slice(1).map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors duration-300 hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <PledgeDialogTrigger variant="outline" arrow className="max-sm:hidden">
            Take the pledge
          </PledgeDialogTrigger>
          <MobileNav />
        </div>
      </Container>
    </HeaderShell>
  );
}
