import Image from "next/image";
import gtechLogo from "@/assets/images/logo-gtech.png";
import mulearnLogo from "@/assets/images/logo-mulearn-white.png";
import { cn } from "@/lib/utils";

/** Campaign partners. White artwork: place on .theme-inverse surfaces only. */
export function PartnerLogos({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <Image src={gtechLogo} alt="GTech" className="h-4 w-auto sm:h-5" sizes="96px" />
      <Image src={mulearnLogo} alt="μLearn" className="h-4 w-auto sm:h-5" sizes="96px" />
    </div>
  );
}
