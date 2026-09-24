"use client";

import { ArrowRight, Menu } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { usePledgeDialog } from "@/features/pledge/components/pledge-dialog-provider";

type PendingAction = { type: "navigate"; href: string } | { type: "pledge" } | null;

/** Slide-in site menu (all breakpoints, as in the original design). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pending = useRef<PendingAction>(null);
  const { openDialog } = usePledgeDialog();

  // Act only after the sheet has closed and released its scroll lock and
  // focus trap; otherwise the page can't scroll to the target.
  function runPendingAction(event: Event) {
    const action = pending.current;
    pending.current = null;
    if (!action) return;
    event.preventDefault();

    if (action.type === "pledge") {
      openDialog("pledge");
      return;
    }
    const target = document.querySelector<HTMLElement>(action.href);
    if (!target) return;
    window.history.pushState(null, "", action.href);
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  }

  function close(action: PendingAction) {
    pending.current = action;
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-12 bg-foreground/10 hover:bg-foreground/20" aria-label="Open menu">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent className="theme-inverse px-8 pt-20 pb-10" onCloseAutoFocus={runPendingAction}>
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Jump to a section or take the pledge.</SheetDescription>

        <nav aria-label="Main" className="flex-1">
          <ul className="flex flex-col items-center gap-8 sm:items-start">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    close({ type: "navigate", href: item.href });
                  }}
                  className="group relative inline-block py-1 text-2xl text-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-300 ease-standard group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t pt-8">
          <Button size="lg" className="w-full" aria-haspopup="dialog" onClick={() => close({ type: "pledge" })}>
            Take the Pledge <ArrowRight />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
