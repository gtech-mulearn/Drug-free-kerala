"use client";

import dynamic from "next/dynamic";
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

export type PledgeDialogName = "pledge" | "lookup";

/** Dialog code (forms, validation, canvas) loads on first use, not with the page. */
export const dialogLoaders = {
  pledge: () => import("./pledge-dialog"),
  lookup: () => import("./lookup-dialog"),
} satisfies Record<PledgeDialogName, () => Promise<unknown>>;

const PledgeDialog = dynamic(() => dialogLoaders.pledge().then((m) => m.PledgeDialog), { ssr: false });
const LookupDialog = dynamic(() => dialogLoaders.lookup().then((m) => m.LookupDialog), { ssr: false });

type PledgeDialogContextValue = { openDialog: (name: PledgeDialogName) => void };

const PledgeDialogContext = createContext<PledgeDialogContextValue | null>(null);

export function PledgeDialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<PledgeDialogName | null>(null);
  const [mounted, setMounted] = useState<ReadonlySet<PledgeDialogName>>(() => new Set());

  const openDialog = useCallback((name: PledgeDialogName) => {
    setMounted((current) => (current.has(name) ? current : new Set(current).add(name)));
    setActive(name);
  }, []);

  // Deep link for QR codes and shared posts: drugfreekerala.com/#pledge
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#pledge") openDialog("pledge");
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [openDialog]);

  const value = useMemo(() => ({ openDialog }), [openDialog]);
  const onOpenChange = (name: PledgeDialogName) => (open: boolean) => setActive(open ? name : null);

  return (
    <PledgeDialogContext value={value}>
      {children}
      {mounted.has("pledge") ? (
        <PledgeDialog
          open={active === "pledge"}
          onOpenChange={onOpenChange("pledge")}
          onFindCertificate={() => openDialog("lookup")}
        />
      ) : null}
      {mounted.has("lookup") ? <LookupDialog open={active === "lookup"} onOpenChange={onOpenChange("lookup")} /> : null}
    </PledgeDialogContext>
  );
}

export function usePledgeDialog(): PledgeDialogContextValue {
  const context = use(PledgeDialogContext);
  if (!context) throw new Error("usePledgeDialog must be used inside <PledgeDialogProvider>");
  return context;
}
