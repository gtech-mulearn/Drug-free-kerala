"use client";

import { Copy, Download, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import certificateTemplate from "@/assets/images/certificate-template.jpg";
import { Button } from "@/components/ui/button";
import { FormAlert, Spinner } from "@/components/ui/form";
import { siteConfig } from "@/config/site";
import { poppins } from "@/lib/fonts";
import { canvasToPng, renderCertificate } from "../lib/render-certificate";
import { buildShareMessage, certificateFileName, shareUrl, type ShareTarget } from "../lib/share";
import type { Certificate } from "../types";

const SHARE_TARGETS: { target: ShareTarget; label: string; Icon: typeof FaXTwitter }[] = [
  { target: "whatsapp", label: "Share on WhatsApp", Icon: FaWhatsapp },
  { target: "x", label: "Share on X", Icon: FaXTwitter },
  { target: "facebook", label: "Share on Facebook", Icon: FaFacebookF },
];

type RenderStatus = "rendering" | "ready" | "error";

/** Renders, downloads and shares a pledge certificate. */
export function CertificateView({ certificate }: { certificate: Certificate }) {
  const { name, certificateId } = certificate;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<RenderStatus>("rendering");
  const [canShareFiles, setCanShareFiles] = useState(false);
  const message = buildShareMessage(certificateId, siteConfig.url);
  const fileName = certificateFileName(certificateId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    renderCertificate(canvas, {
      name,
      certificateId,
      templateSrc: certificateTemplate.src,
      fontFamily: poppins.style.fontFamily,
    })
      .then(() => {
        if (cancelled) return;
        setStatus("ready");
        const probe = new File([], fileName, { type: "image/png" });
        setCanShareFiles(typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }));
      })
      .catch((error: unknown) => {
        console.error("[certificate] render failed", error instanceof Error ? error.message : error);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [name, certificateId, fileName]);

  async function download() {
    if (!canvasRef.current) return;
    const url = URL.createObjectURL(await canvasToPng(canvasRef.current));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function shareImage() {
    if (!canvasRef.current) return;
    const file = new File([await canvasToPng(canvasRef.current)], fileName, { type: "image/png" });
    try {
      await navigator.share({ files: [file], text: message });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Sharing isn't available here. Download the certificate instead.");
    }
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(certificateId);
      toast.success("Certificate ID copied");
    } catch {
      toast.error("Couldn't copy. Select the ID and copy it manually.");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Drug Free Kerala pledge certificate for ${name}, ID ${certificateId}`}
          className="size-full"
        />
        {status === "rendering" ? (
          <div className="absolute inset-0 grid place-items-center">
            <Spinner className="size-8 text-primary" />
            <span className="sr-only">Preparing your certificate…</span>
          </div>
        ) : null}
      </div>

      {status === "error" ? (
        <FormAlert>We couldn&apos;t draw your certificate. Close this window and try again.</FormAlert>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
        <div className="grid gap-0.5">
          <span className="text-xs text-muted-foreground">Certificate ID</span>
          <span className="font-semibold tracking-wide text-primary tabular-nums">{certificateId}</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={copyId} aria-label="Copy certificate ID">
          <Copy />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" onClick={download} disabled={status !== "ready"}>
          <Download /> Download
        </Button>
        {canShareFiles ? (
          <Button size="lg" variant="outline" onClick={shareImage} disabled={status !== "ready"}>
            <Share2 /> Share image
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-sm text-muted-foreground">Share the pledge</span>
        {SHARE_TARGETS.map(({ target, label, Icon }) => (
          <Button key={target} variant="outline" size="icon" asChild>
            <a href={shareUrl(target, message, siteConfig.url)} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon aria-hidden="true" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
