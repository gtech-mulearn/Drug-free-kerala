import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import logoWhite from "@/assets/images/logo-drug-free-kerala-white.png";
import { Button } from "@/components/ui/button";
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

const linkClass = "rounded-sm transition-colors hover:text-primary hover:underline underline-offset-4";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      tabIndex={-1}
      className="theme-inverse mt-20 rounded-t-section bg-background pt-14 pb-8 text-foreground outline-none"
    >
      <Container className="grid gap-12 md:grid-cols-12">
        <div className="flex flex-col gap-6 md:col-span-4">
          <Image src={logoWhite} alt="Drug Free Kerala" className="h-16 w-auto self-start" sizes="172px" />
          <Text className="max-w-sm">
            Empowering youth through innovation, creativity, and purpose-driven engagement to create a drug-free
            society across Kerala.
          </Text>
          <ul className="flex items-center gap-3" aria-label="Follow us">
            {siteConfig.social.map(({ label, icon, href }) => {
              const Icon = SOCIAL_ICONS[icon];
              return (
                <li key={icon}>
                  <Button variant="ghost" size="icon-sm" className="bg-foreground/10 hover:bg-foreground/20" asChild>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon aria-hidden="true" />
                    </a>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-labelledby="footer-links" className="flex flex-col gap-4 md:col-span-3 md:col-start-6">
          <h2 id="footer-links" className="font-medium">
            Quick links
          </h2>
          <ul className="flex flex-col gap-3 text-foreground/90">
            {siteConfig.nav.slice(1, 4).map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClass}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <PledgeDialogTrigger variant="link" className="text-base font-normal text-foreground/90 hover:text-primary">
                Take the Pledge
              </PledgeDialogTrigger>
            </li>
            <li>
              <PledgeDialogTrigger
                dialog="lookup"
                variant="link"
                className="text-base font-normal text-foreground/90 hover:text-primary"
              >
                Find my certificate
              </PledgeDialogTrigger>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-4 md:col-span-4 md:col-start-9">
          <h2 className="font-medium">Contact us</h2>
          <address className="flex flex-col gap-4 not-italic font-light">
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
      </Container>

      <Container className="mt-12">
        <div className="flex flex-col items-center justify-between gap-5 border-t pt-6 text-sm md:flex-row">
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
          <PartnerLogos />
        </div>
      </Container>
    </footer>
  );
}
