export function certificateFileName(certificateId: string): string {
  return `DrugFreeKerala-Certificate-${certificateId}.png`;
}

/** The campaign's share message (copy approved for the original launch). */
export function buildShareMessage(certificateId: string, siteUrl: string): string {
  const host = new URL(siteUrl).host;
  return `Proud to be part of the movement!

I've taken a pledge to stand strong against drug abuse and contribute to building a healthier, drug-free Kerala. 🕊

Substance abuse impacts not just individuals but entire communities. By choosing to stay informed and aware, we can lead by example and empower others to do the same. Together, we can build a stronger, safer society.

A huge thank you to μLearn and the Group of Technology Companies (GTech) for creating this powerful avenue to raise awareness and inspire collective action. 💚

🆔 My Pledge ID: ${certificateId}
NammalOttakkettu for a #drugfreeKerala

#StrongerWithoutDrugs #DrugFreeKerala #HealthyLiving #YouthForChange #mulearn #Gtech #SocialImpact #SayNoToDrugs #TogetherWeCan

${host}`;
}

export type ShareTarget = "x" | "facebook" | "whatsapp";

export function shareUrl(target: ShareTarget, message: string, siteUrl: string): string {
  switch (target) {
    case "x":
      return `https://x.com/intent/tweet?text=${encodeURIComponent(message)}`;
    case "facebook":
      // Facebook ignores prefilled text; it shares the page URL and its OG preview.
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
}
