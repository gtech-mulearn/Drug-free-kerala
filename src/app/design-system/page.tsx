import { CircleAlert, CircleCheck, Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DoveMark } from "@/components/brand/dove-mark";
import { Logo, Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Checkbox, FormAlert, FormField, Input } from "@/components/ui/form";
import { Grain } from "@/components/ui/grain";
import { Heading } from "@/components/ui/heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { Tile } from "@/components/ui/tile";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/** Each swatch pairs a surface with the text token meant to sit on it. */
const SURFACES = [
  { token: "background", className: "bg-background text-foreground" },
  { token: "card", className: "bg-card text-card-foreground" },
  { token: "popover", className: "bg-popover text-popover-foreground" },
  { token: "muted", className: "bg-muted text-muted-foreground" },
  { token: "accent", className: "bg-accent text-accent-foreground" },
  { token: "surface-wash", className: "bg-surface-wash text-surface-wash-foreground" },
  { token: "primary", className: "bg-primary text-primary-foreground" },
  { token: "secondary", className: "bg-secondary text-secondary-foreground" },
  { token: "brand", className: "bg-brand text-brand-foreground" },
  { token: "destructive", className: "bg-destructive text-destructive-foreground" },
] as const;

const LINES = [
  { token: "border", className: "border-2 border-border" },
  { token: "input", className: "border-2 border-input" },
  { token: "ring", className: "ring-[3px] ring-ring" },
] as const;

const TYPE_SCALE = [
  { name: "Heading · hero", node: <Heading as="p" size="hero">United against</Heading> },
  { name: "Heading · display", node: <Heading as="p" size="display">From Darkness to Light</Heading> },
  { name: "Heading · display, caps", node: <Heading as="p" size="display" caps>Our three pillars</Heading> },
  { name: "Heading · headline", node: <Heading as="p">A drug-free Kerala starts with you.</Heading> },
  { name: "Heading · title", node: <Heading as="p" size="title">Social Engagement</Heading> },
  { name: "Heading · subtitle", node: <Heading as="p" size="subtitle">GTech Marathon 2023</Heading> },
  { name: "Heading · counter", node: <Heading as="p" size="counter">5,886</Heading> },
  { name: "Heading · poster", node: <Heading as="p" size="poster">5,886</Heading> },
  { name: "Text · statement", node: <Text size="statement">A powerful alliance between GTech, µLearn and the Kerala Excise Department.</Text> },
  { name: "Text · lead", node: <Text size="lead">Taking concrete steps through support services.</Text> },
  { name: "Text · body", node: <Text>Empowering youth with factual information about drugs.</Text> },
  { name: "Text · body, muted", node: <Text tone="muted">Supporting copy uses the muted foreground.</Text> },
  { name: "Text · highlight", node: <Text className="text-highlight">Emphasis: teal-700 on light, mint on forest.</Text> },
];

const BUTTON_VARIANTS = ["primary", "secondary", "outline", "ghost", "link"] as const;
const BUTTON_SIZES = ["sm", "md", "lg", "xl"] as const;

const MOTION_ATTRIBUTES = [
  ["data-reveal", "Fades and rises 24 px on entry; siblings stagger 0.08 s."],
  ["data-split", "Lines rise out of masks (SplitText). Headings and statements."],
  ["data-clip", "Media frame opens upward; [data-clip-media] settles from 115 %."],
  ["data-count", "Number counts up from 0 on first view (useCountUp)."],
  ["data-parallax=\"6\"", "Scrubbed drift of ±6 % while the parent crosses the screen."],
  ["data-warm / data-warm-layer", "Duotone layer fades out near the centre of the screen."],
  ["data-spy / data-spy-target", "Marks the index entry of whatever is centred (data-active)."],
  ["data-rise", "Scrubbed rise out of the parent's mask (footer wordmark)."],
] as const;

/** Renders the same content on the light theme and inside .theme-inverse. */
function BothThemes({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-background p-6 text-foreground">
        <p className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Light</p>
        {children}
      </div>
      <div className="theme-inverse rounded-xl border bg-background p-6 text-foreground">
        <p className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Inverse</p>
        {children}
      </div>
    </div>
  );
}

function Block({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t py-12">
      <div className="grid gap-2">
        <Heading id={id} size="title">
          {title}
        </Heading>
        <Text tone="muted" className="max-w-3xl">
          {description}
        </Text>
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  // Development-only reference page.
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main>
      <Section tone="inverse" className="pt-16">
        <Grain />
        <Container>
          <SectionHeader
            align="start"
            title="Drug Free Kerala design system"
            description="Every token and component, rendered live in both themes. Rules and rationale: docs/design-system.md."
            className="mb-0 md:mb-0"
          />
        </Container>
      </Section>

      <Container className="pb-24">
        <Block
          id="colour"
          title="Colour tokens"
          description="Components use only these semantic tokens. .theme-inverse re-maps the same names for forest surfaces, so nothing branches on theme. Contrast of every pair is enforced by src/test/design-system/contrast.test.ts."
        >
          <BothThemes>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {SURFACES.map(({ token, className }) => (
                <li key={token} className={`${className} grid h-24 content-between rounded-lg border p-3`}>
                  <span className="text-xl font-semibold">Aa</span>
                  <span className="text-xs font-medium">{token}</span>
                </li>
              ))}
              {LINES.map(({ token, className }) => (
                <li key={token} className={`${className} grid h-24 content-end rounded-lg p-3`}>
                  <span className="text-xs font-medium">{token}</span>
                </li>
              ))}
              <li className="grid h-24 content-end rounded-lg bg-linear-to-br from-mark-start to-mark-end p-3 text-brand-foreground">
                <span className="text-xs font-medium">mark-start → mark-end</span>
              </li>
            </ul>
          </BothThemes>
        </Block>

        <Block
          id="type"
          title="Typography"
          description="Inter Tight for everything; Bebas Neue (the logo's lettering) for numerals and the wordmark only. Heading sizes are independent of document level: choose `as` for the outline and `size` for the look."
        >
          <dl className="grid gap-6">
            {TYPE_SCALE.map(({ name, node }) => (
              <div key={name} className="grid gap-1 md:grid-cols-[12rem_1fr] md:items-baseline">
                <dt className="text-xs font-medium text-muted-foreground">{name}</dt>
                <dd>{node}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block
          id="brand"
          title="Brand marks"
          description="The logo rebuilt as SVG: the dove traced from the artwork (scripts/trace-dove.py), the cage measured, the wordmark set in Bebas Neue. Gradient ids are unique per instance."
        >
          <BothThemes>
            <div className="grid gap-8">
              <div className="flex flex-wrap items-end gap-8">
                <Logo className="h-16" />
                <DoveMark className="h-16 w-auto" />
                <DoveMark cage className="h-16 w-auto" />
                <DoveMark tone="solid" className="h-16 w-auto text-highlight" />
              </div>
              <Wordmark />
            </div>
          </BothThemes>
        </Block>

        <Block
          id="buttons"
          title="Buttons"
          description="Pills. `primary` is the call to action: forest on light surfaces, mint on inverse. `arrow` adds the round arrow badge (a plain arrow on links). Buttons default to type=&quot;button&quot;; use asChild to style links."
        >
          <BothThemes>
            <div className="grid gap-5">
              {BUTTON_VARIANTS.map((variant) => (
                <div key={variant} className="flex flex-wrap items-center gap-3">
                  {BUTTON_SIZES.map((size) => (
                    <Button key={size} variant={variant} size={size}>
                      {variant} {size}
                    </Button>
                  ))}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <Button arrow size="lg">
                  Take the pledge
                </Button>
                <Button arrow variant="outline">
                  Take the pledge
                </Button>
                <Button arrow variant="link">
                  Find my certificate
                </Button>
                <Button size="icon" aria-label="Icon button">
                  <Megaphone />
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </BothThemes>
        </Block>

        <Block id="labels" title="Eyebrows and tags" description="Eyebrow labels a section; tags list keywords. Both inherit colour from their surface.">
          <BothThemes>
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>Who we are</Eyebrow>
              <Tag>Peer mentoring</Tag>
              <Tag tone="solid">Skill-building</Tag>
              <Tag tone="brand">Community</Tag>
            </div>
          </BothThemes>
        </Block>

        <Block id="tiles" title="Tiles" description="The pillar grid. `forest` and `photo` re-theme their contents to the inverse theme.">
          <div className="grid gap-3 md:grid-cols-4">
            {(["light", "brand", "forest", "photo"] as const).map((tone) => (
              <Tile key={tone} tone={tone} className="min-h-56 border">
                <Heading as="p" size="headline" className="font-semibold">
                  {tone}
                </Heading>
                <Text size="sm">Small copy sits at the bottom of the tile.</Text>
              </Tile>
            ))}
          </div>
        </Block>

        <Block
          id="forms"
          title="Forms"
          description="FormField wires label, description and error to its control (aria-describedby, aria-invalid). Validation messages come from the shared zod schemas."
        >
          <BothThemes>
            <div className="grid max-w-xl gap-5">
              <FormField name="demo-name" label="Your name" description="Printed on your certificate exactly as you type it.">
                {(control) => <Input {...control} defaultValue="Anjali Nair" />}
              </FormField>
              <FormField name="demo-email" label="Email" errors={["Enter a valid email address."]}>
                {(control) => <Input {...control} defaultValue="anjali@" />}
              </FormField>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox name="demo" defaultChecked /> I am aware of the harmful effects that drugs have on our society.
              </label>
              <FormAlert>Too many attempts from your network. Please try again in 5 minutes.</FormAlert>
              <FormAlert tone="info">Your pledge was saved.</FormAlert>
            </div>
          </BothThemes>
        </Block>

        <Block id="surfaces" title="Cards and icon badges" description="Cards use the card radius and elevation tokens; `interactive` adds the hover lift.">
          <div className="grid gap-4 md:grid-cols-3">
            <Card interactive className="flex items-center gap-4">
              <IconBadge tone="accent">
                <CircleCheck />
              </IconBadge>
              <Text weight="medium">Card · default</Text>
            </Card>
            <Card tone="accent" interactive className="flex items-center gap-4">
              <IconBadge>
                <CircleAlert />
              </IconBadge>
              <Text weight="medium">Card · accent</Text>
            </Card>
            <Card tone="inverse" interactive className="flex items-center gap-4">
              <IconBadge tone="subtle">
                <Megaphone />
              </IconBadge>
              <Text weight="medium">Card · inverse</Text>
            </Card>
          </div>
        </Block>

        <Block
          id="motion"
          title="Motion attributes"
          description="Sections stay Server Components and mark elements; src/components/motion/motion-runtime.tsx wires GSAP to these attributes. Reduced motion, no JavaScript and slow devices all get the content at rest (see src/styles/motion.css)."
        >
          <dl className="grid gap-3">
            {MOTION_ATTRIBUTES.map(([attribute, effect]) => (
              <div key={attribute} className="grid gap-1 md:grid-cols-[16rem_1fr]">
                <dt className="font-mono text-sm">{attribute}</dt>
                <dd className="text-sm text-muted-foreground">{effect}</dd>
              </div>
            ))}
          </dl>
        </Block>
      </Container>
    </main>
  );
}
