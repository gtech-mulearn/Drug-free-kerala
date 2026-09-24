"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { dialogLoaders, usePledgeDialog, type PledgeDialogName } from "./pledge-dialog-provider";

export type PledgeDialogTriggerProps = Omit<ButtonProps, "asChild"> & { dialog?: PledgeDialogName };

/** A button that opens the pledge (default) or certificate-lookup dialog. */
export function PledgeDialogTrigger({
  dialog = "pledge",
  onClick,
  onPointerEnter,
  onFocus,
  ...props
}: PledgeDialogTriggerProps) {
  const { openDialog } = usePledgeDialog();
  // Warm the dialog's code before the click lands.
  const preload = () => void dialogLoaders[dialog]();

  return (
    <Button
      aria-haspopup="dialog"
      {...props}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        preload();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        preload();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openDialog(dialog);
      }}
    />
  );
}
