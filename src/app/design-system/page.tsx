import { CircleAlert, CircleCheck, Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, FormAlert, FormField, Input } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";

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
  { token: "surface-brand", className: "bg-surface-brand text-surface-brand-foreground" },
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
  { name: "Heading · counter", node: <Heading as="p" size="counter">5,886</Heading> },
  { name: "Heading · display", node: <Heading as="p" size="display">United against addiction</Heading> },
  { name: "Heading · headline", node: <Heading as="p">Our <strong>Three Pillars</strong></Heading> },
  { name: "Heading · title", node: <Heading as="p" size="title">Awareness</Heading> },
  { name: "Heading · subtitle", node: <Heading as="p" size="subtitle">GTECH Initiative</Heading> },
  { name: "Text · lead", node: <Text size="lead">Taking concrete steps through support services.</Text> },
  { name: "Text · body", node: <Text>Empowering youth with factual information about drugs.</Text> },
  { name: "Text · body, muted", node: <Text tone="muted">Supporting copy uses the muted foreground.</Text> },
  { name: "Text · sm", node: <Text size="sm">Printed on your certificate exactly as you type it.</Text> },
];

const BUTTON_VARIANTS = ["primary", "secondary", "outline", "ghost", "link"] as const;
const BUTTON_SIZES = ["sm", "md", "lg", "xl"] as const;

/** Renders the same content on the light theme and inside .theme-inverse. */
function BothThemes({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-background p-6 text-foreground">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Light</p>
        {children}
      </div>
      <div className="theme-inverse rounded-xl border bg-background p-6 text-foreground">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inverse</p>
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
        <Container>
          <SectionHeader
            align="start"
            title={
              <>
                Drug Free Kerala <strong>design system</strong>
              </>
            }
            description="Every token and component, rendered live in both themes. Rules and rationale: docs/design-system.md."
            className="mb-0 md:mb-0"
          />
        </Container>
      </Section>

      <Container className="pb-24">
        <Block
          id="colour"
          title="Colour tokens"
          description="Components use only these semantic tokens. .theme-inverse re-maps the same names for dark surfaces, so nothing branches on theme. Contrast of every pair is enforced by src/test/design-system/contrast.test.ts."
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
            </ul>
          </BothThemes>
        </Block>

        <Block
          id="type"
          title="Typography"
          description="Poppins, self-hosted. Heading sizes are independent of document level: choose `as` for the outline and `size` for the look."
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
          id="buttons"
          title="Buttons"
          description="`primary` is the call to action: deep green on light surfaces, brand green on inverse. Buttons default to type=&quot;button&quot;; use asChild to style links."
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
                <Button size="icon" aria-label="Icon button">
                  <Megaphone />
                </Button>
                <Button size="icon-sm" variant="outline" aria-label="Small icon button">
                  <Megaphone />
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </BothThemes>
        </Block>

        <Block
          id="forms"
          title="Forms"
          description="FormField wires label, description and error to its control (aria-describedby, aria-invalid). Validation messages come from the shared zod schemas."
        >
          <div className="grid max-w-xl gap-5 rounded-xl border bg-card p-6 text-card-foreground">
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
      </Container>
    </main>
  );
}
