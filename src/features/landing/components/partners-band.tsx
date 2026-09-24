import Image from "next/image";
import { MaskedLogo } from "@/components/layout/partner-logos";
import { LogoLoop, type LogoItem } from "@/components/motion/logo-loop";
import { Container, Section } from "@/components/ui/layout";
import { partners, type Partner } from "../content";

/** Height of a square logo; others are balanced around it (see heightFor). */
const REFERENCE_HEIGHT = 56;
/** 0 = equal heights, 0.5 = equal areas: wide wordmarks and tall emblems carry similar weight. */
const WEIGHT = 0.45;

const heightFor = ({ logo }: Partner) => Math.round(REFERENCE_HEIGHT / (logo.width / logo.height) ** WEIGHT);

function PartnerMark({ partner }: { partner: Partner }) {
  const height = heightFor(partner);
  const mark =
    partner.treatment === "mono" ? (
      <MaskedLogo image={partner.logo} height={height} />
    ) : (
      <Image
        src={partner.logo}
        alt=""
        height={height}
        style={{ height, width: "auto" }}
        sizes={`${Math.round((height * partner.logo.width) / partner.logo.height)}px`}
      />
    );

  if (!partner.caption) return mark;
  return (
    <span className="flex items-center gap-3">
      {mark}
      <span aria-hidden="true" className="text-sm leading-tight font-semibold whitespace-pre-line">
        {partner.caption}
      </span>
    </span>
  );
}

const LOGOS: LogoItem[] = partners.items.map((partner) => ({
  key: partner.key,
  title: partner.name,
  node: <PartnerMark partner={partner} />,
}));

/** The partners behind the movement, as a slow logo loop under "Who we are". */
export function PartnersBand() {
  return (
    <Section spacing="none" aria-labelledby="partners-title" className="pb-section">
      <Container className="flex flex-col gap-8">
        <p id="partners-title" data-reveal className="text-center text-sm font-medium text-muted-foreground">
          {partners.label}
        </p>
        <LogoLoop logos={LOGOS} ariaLabel="Partner logos" />
      </Container>
    </Section>
  );
}
