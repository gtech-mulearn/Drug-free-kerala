/** Site-wide facts used by layout, metadata and SEO routes. */
export const siteConfig = {
  name: "Drug Free Kerala",
  url: "https://drugfreekerala.com",
  tagline: "United against addiction",
  description:
    "Our movement has one objective – to turn intoxicated lives into vibrant communities. Take the Drug Free Kerala pledge with μLearn and GTech.",
  locale: "en_IN",

  nav: [
    { label: "Home", href: "#top" },
    { label: "About", href: "#about" },
    { label: "Initiatives", href: "#initiatives" },
    { label: "Journey", href: "#journey" },
    { label: "Contact", href: "#contact" },
  ],

  social: [
    { label: "Facebook", icon: "facebook", href: "https://www.facebook.com/gtechmulearn" },
    { label: "X (Twitter)", icon: "x", href: "https://x.com/GtechMulearn" },
    { label: "Instagram", icon: "instagram", href: "https://www.instagram.com/mulearn.official/" },
    { label: "LinkedIn", icon: "linkedin", href: "https://www.linkedin.com/company/gtechmulearn/" },
    { label: "WhatsApp community", icon: "whatsapp", href: "https://chat.whatsapp.com/BoA0aibDSqNL60qBRslCww" },
  ],

  footer: {
    closing: "Kerala, united against addiction.",
    blurb:
      "Empowering youth through innovation, creativity, and purpose-driven engagement to create a drug-free society across Kerala.",
  },

  contact: {
    email: "info@mulearn.org",
    phone: { label: "+91 8590276004", href: "tel:+918590276004" },
    address: ["Technopark, Kazhakoottam, Trivandrum", "695581, Kerala, India."],
  },

  legal: [
    { label: "Privacy Policy", href: "https://mulearn.org/privacy-policy" },
    { label: "Terms of Service", href: "https://mulearn.org/terms-and-conditions" },
  ],
} as const;

export type SocialIcon = (typeof siteConfig.social)[number]["icon"];
