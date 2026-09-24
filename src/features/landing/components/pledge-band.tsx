import { Suspense } from "react";
import { PartnerLogos } from "@/components/layout/partner-logos";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { PledgeDialogTrigger } from "@/features/pledge/components/pledge-dialog-trigger";
import { pledgeBand } from "../content";
import { loadInitialPledgeTotal } from "../lib/initial-pledge-total";
import { PosterCounter } from "./live-pledge-total";

async function PosterPledgeTotal() {
  return <PosterCounter initialTotal={await loadInitialPledgeTotal()} />;
}

/** Divi's light stats band, carrying the one real number: the live pledge count. */
export function PledgeBand() {
  return (
    <Section tone="wash" aria-labelledby="pledge-band-title" className="overflow-hidden">
      <Container>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2 border-b border-foreground/15 pb-8">
          <Suspense fallback={<PosterCounter initialTotal={null} />}>
            <PosterPledgeTotal />
          </Suspense>
          <p data-reveal className="pb-[0.6em] text-lg font-medium text-muted-foreground sm:text-xl">
            {pledgeBand.counterLabel}
          </p>
        </div>

        <div className="grid gap-8 py-12 lg:grid-cols-12 lg:py-16">
          <div className="flex flex-col items-start gap-7 lg:col-span-6">
            <Heading id="pledge-band-title" size="display" data-split>
              {pledgeBand.title}
            </Heading>
            <PledgeDialogTrigger size="lg" arrow data-reveal>
              Take the pledge
            </PledgeDialogTrigger>
          </div>
          <div className="flex flex-col items-start gap-5 lg:col-span-5 lg:col-start-8 lg:pt-4">
            <Text size="lead" data-reveal>
              {pledgeBand.body}
            </Text>
            <PledgeDialogTrigger dialog="lookup" variant="link" arrow data-reveal className="text-foreground">
              Find my certificate
            </PledgeDialogTrigger>
          </div>
        </div>

        <div
          data-reveal
          className="flex flex-col gap-4 border-t border-foreground/15 pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-medium text-muted-foreground">{pledgeBand.partnersLabel}</p>
          <PartnerLogos />
        </div>
      </Container>
    </Section>
  );
}
