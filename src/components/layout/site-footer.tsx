import { Mail, MapPin, Phone } from "lucide-react";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { Logo, Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Grain } from "@/components/ui/grain";
import { Heading } from "@/components/ui/heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { siteConfig, type SocialIcon } from "@/config/site";
import { PledgeDialogTrigger } from "@/features/pledge/components/pledge-dialog-trigger";
import { PartnerLogos } from "./partner-logos";

const SOCIAL_ICONS: Record<SocialIcon, IconType> = {
  facebook: FaFacebookF,
  x: FaXTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
};

const linkClass = "rounded-sm transition-colors duration-300 hover:text-highlight";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      tabIndex={-1}
      className="theme-inverse relative isolate overflow-hidden bg-background pt-section text-foreground outline-none"
    >
      <Grain />
      <Container>
        <div className="flex flex-col gap-8 border-b pb-14 lg:flex-row lg:items-end lg:justify-between">
          <Heading as="h2" size="display" data-split className="max-w-2xl">
            {siteConfig.footer.closing}
          </Heading>
          <PledgeDialogTrigger size="lg" arrow data-reveal className="self-start lg:self-auto">
            Take the pledge
          </PledgeDialogTrigger>
        </div>

        <div className="grid gap-12 py-14 md:grid-cols-12">
          <div className="flex flex-col gap-6 md:col-span-4">
            <Logo decorative className="h-14 self-start" />
            <Text tone="muted" className="max-w-sm">
              {siteConfig.footer.blurb}
            </Text>
            <ul className="flex items-center gap-2" aria-label="Follow us">
              {siteConfig.social.map(({ label, icon, href }) => {
                const Icon = SOCIAL_ICONS[icon];
                return (
                  <li key={icon}>
                    <Button variant="outline" size="icon-sm" className="border-border" asChild>
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                        <Icon aria-hidden="true" />
                      </a>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-labelledby="footer-links" className="flex flex-col gap-5 md:col-span-3 md:col-start-6">
            <h2 id="footer-links" className="text-sm font-medium text-muted-foreground">
              Quick links
            </h2>
            <ul className="flex flex-col gap-3">
              {siteConfig.nav.slice(1, 4).map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <PledgeDialogTrigger variant="link" className="text-base font-normal text-foreground hover:text-highlight hover:no-underline">
                  Take the Pledge
                </PledgeDialogTrigger>
              </li>
              <li>
                <PledgeDialogTrigger
                  dialog="lookup"
                  variant="link"
                  className="text-base font-normal text-foreground hover:text-highlight hover:no-underline"
                >
                  Find my certificate
                </PledgeDialogTrigger>
              </li>
            </ul>
          </nav>

          <div className="flex flex-col gap-5 md:col-span-4 md:col-start-9">
            <h2 className="text-sm font-medium text-muted-foreground">Contact us</h2>
            <address className="flex flex-col gap-4 not-italic">
              <span className="flex items-center gap-3">
                <IconBadge tone="subtle" size="sm">
                  <Mail />
                </IconBadge>
                <a href={`mailto:${siteConfig.contact.email}`} className={linkClass}>
                  {siteConfig.contact.email}
                </a>
              </span>
              <span className="flex items-start gap-3">
                <IconBadge tone="subtle" size="sm">
                  <MapPin />
                </IconBadge>
                <span className="pt-2">
                  {siteConfig.contact.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <IconBadge tone="subtle" size="sm">
                  <Phone />
                </IconBadge>
                <a href={siteConfig.contact.phone.href} className={linkClass}>
                  {siteConfig.contact.phone.label}
                </a>
              </span>
            </address>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t py-6 text-sm text-muted-foreground md:flex-row">
          <p>© {year} Drug Free Kerala. All rights reserved.</p>
          <ul className="flex items-center gap-6">
            {siteConfig.legal.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClass}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <PartnerLogos className="text-foreground" />
        </div>
      </Container>

      <div aria-hidden="true" className="overflow-hidden px-gutter pt-4">
        <div data-rise>
          <Wordmark className="translate-y-[6%]" />
        </div>
      </div>
    </footer>
  );
}
