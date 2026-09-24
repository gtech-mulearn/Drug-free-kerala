"use client";

import { useRef, useSyncExternalStore } from "react";
import { useCountUp } from "@/components/motion/count-up";
import { Heading } from "@/components/ui/heading";
import { getLatestPledgeTotal, subscribePledgeTotal } from "./pledge-total-store";

const formatter = new Intl.NumberFormat("en-IN");
const formatNumber = (value: number) => formatter.format(value);
export const formatTotal = (total: number | null) => (total === null ? "—" : formatNumber(total));

/**
 * The live total. The server snapshot is the streamed initial total, so the
 * HTML always carries the real number (no "0" flash; crawlers see it).
 */
export function useLivePledgeTotal(initialTotal: number | null): number | null {
  return useSyncExternalStore(
    subscribePledgeTotal,
    () => getLatestPledgeTotal() ?? initialTotal,
    () => initialTotal,
  );
}

/** The count over the hero photo; rolls up from 0 once the page is interactive. */
export function HeroPledgeCount({ initialTotal }: { initialTotal: number | null }) {
  const total = useLivePledgeTotal(initialTotal);
  const number = useRef<HTMLSpanElement>(null);
  useCountUp(number, total, formatNumber);

  return (
    <div className="text-foreground">
      <p className="text-sm font-medium text-foreground/80">Pledges taken</p>
      <Heading as="p" size="counter" data-testid="pledge-total" className="mt-2">
        <span ref={number} data-count aria-hidden="true" className="inline-block">
          {formatTotal(total)}
        </span>
        <span className="sr-only">{formatTotal(total)} pledges</span>
      </Heading>
    </div>
  );
}

/** The poster-size count in the pledge band; rolls up from 0 on first view. */
export function PosterCounter({ initialTotal }: { initialTotal: number | null }) {
  const total = useLivePledgeTotal(initialTotal);
  const number = useRef<HTMLSpanElement>(null);
  useCountUp(number, total, formatNumber);

  return (
    <Heading as="p" size="poster" data-testid="pledge-total-poster">
      <span ref={number} data-count aria-hidden="true" className="inline-block">
        {formatTotal(total)}
      </span>
      <span className="sr-only">{formatTotal(total)} pledges</span>
    </Heading>
  );
}
