"use client";

import { Menu } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { Logo } from "@/components/brand/logo";
import { scrollToTarget } from "@/components/motion/scroll";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { usePledgeDialog, type PledgeDialogName } from "@/features/pledge/components/pledge-dialog-provider";

type PendingAction = { type: "navigate"; href: string } | { type: "dialog"; name: PledgeDialogName } | null;

/** Full-screen forest menu (below the desktop breakpoint). */
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

    if (action.type === "dialog") {
      openDialog(action.name);
      return;
    }
    const target = document.querySelector<HTMLElement>(action.href);
    if (!target) return;
    window.history.pushState(null, "", action.href);
    scrollToTarget(target);
    target.focus({ preventScroll: true });
  }

  function close(action: PendingAction) {
    pending.current = action;
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="bg-foreground/10 hover:bg-foreground/20 lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="full"
        className="theme-inverse gap-0 bg-background px-gutter pt-5 pb-8 text-foreground"
        onCloseAutoFocus={runPendingAction}
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Jump to a section or take the pledge.</SheetDescription>

        <Logo decorative className="h-10 self-start" />

        <nav aria-label="Main" className="flex flex-1 items-center py-10">
          <ul className="flex flex-col gap-1">
            {siteConfig.nav.map((item, index) => (
              <li key={item.href} className="overflow-hidden">
                <a
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    close({ type: "navigate", href: item.href });
                  }}
                  style={{ "--line": index } as CSSProperties}
                  className="menu-line block py-1 text-display font-medium tracking-display text-foreground/70 transition-colors duration-300 hover:text-foreground focus-visible:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-3 border-t pt-6 sm:grid-cols-2">
          <Button size="lg" arrow aria-haspopup="dialog" onClick={() => close({ type: "dialog", name: "pledge" })}>
            Take the pledge
          </Button>
          <Button size="lg" variant="outline" aria-haspopup="dialog" onClick={() => close({ type: "dialog", name: "lookup" })}>
            Find my certificate
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
