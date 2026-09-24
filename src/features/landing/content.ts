import type { StaticImageData } from "next/image";
import heroMarathon from "@/assets/images/GTech-Marathon-2025.jpeg";
import initiativeCommunity from "@/assets/images/initiative-community.png";
import initiativeGtech from "@/assets/images/initiative-gtech.png";
import initiativeMulearn from "@/assets/images/initiative-mulearn.png";
import initiativeSocial from "@/assets/images/initiative-social.png";
import journey01 from "@/assets/images/journey-01.jpg";
import journey02 from "@/assets/images/journey-02.jpg";
import journey03 from "@/assets/images/journey-03.jpg";
import journey04 from "@/assets/images/journey-04.jpg";
import journey05 from "@/assets/images/journey-05.jpg";
import journey06 from "@/assets/images/journey-06.jpg";
import journeyStill2023 from "@/assets/images/journey-still-2023.jpg";
import journeyStill2024 from "@/assets/images/journey-still-2024.jpg";
import journeyStill2025 from "@/assets/images/journey-still-2025.jpg";
import journeyStill2026 from "@/assets/images/journey-still-2026.jpg";
import operationThunder from "@/assets/images/operation-thunder.jpg";
import logoGtech from "@/assets/images/logo-gtech.png";
import logoMulearn from "@/assets/images/logo-mulearn-white.png";
import partnerKeralaExcise from "@/assets/images/partners/kerala-excise.webp";
import partnerMayangilla from "@/assets/images/partners/mayangilla-keralam.webp";
import partnerOperationThunder from "@/assets/images/partners/operation-thunder.webp";

/* Landing-page copy and media. Edit content here, not in components. */

/** Copy with emphasised runs: plain strings, or `{ strong }` for names that must stand out. */
export type RichText = ReadonlyArray<string | { strong: string }>;

export const hero = {
  /** The campaign this movement belongs to, above the headline. */
  campaign: "#OperationThunder",
  /** Two fixed lines: each rises out of its own mask. */
  title: ["United against", "addiction."],
  /** Names the alliance behind the movement; the partners are emphasised. */
  lead: [
    { strong: "GTech" },
    " and ",
    { strong: "µLearn" },
    " have joined hands with the ",
    { strong: "Kerala Excise Department" },
    " for one objective: to turn intoxicated lives into vibrant communities.",
  ] satisfies RichText,
  image: heroMarathon,
  imageAlt: "Runners in yellow GTECH Kerala Marathon shirts on a city road",
  /** The campaign lines that run along the curved ribbon. */
  ribbon: ["United against addiction", "For us, for good", "Ending addiction", "Towards a greater good"],
} as const;

export const about = {
  eyebrow: "Who we are",
  title: { before: "Towards a", highlight: "Drug-Free", after: "Kerala" },
  body: "A powerful alliance between GTech, µLearn and the Kerala Excise Department, empowering youth with factual information about drugs so that they can make informed decisions and live drug-free.",
  video: { id: "hR5dDT7omLM", title: "Towards a Drug-Free Kerala: campaign film" },
  /** What the programme does, from the copy below. */
  tags: ["Awareness", "Peer mentoring", "Sensitization", "Rehabilitation support", "Community"],
} as const;

export const whoWeAre = [
  "We are committed to raising awareness against drug abuse through education, media campaigns, and active community participation.",
  "Our initiative involves sensitization programs for students, parents, and teachers, along with peer mentoring, community engagement, and rehabilitation support.",
] as const;

export const pillars = {
  title: "Our three pillars",
  /** Decorative photo tile beside the pillars. */
  image: initiativeCommunity,
  description:
    "A comprehensive approach to creating drug-free environments through awareness, prevention, and action.",
  items: [
    { icon: "alert", title: "Alert", description: "Mechanism to alert on substance abuse and prevention measures." },
    {
      icon: "awareness",
      title: "Awareness",
      description: "Comprehensive awareness programs for students, parents, and teachers.",
    },
    { icon: "action", title: "Action", description: "Taking concrete steps through support services and engagement." },
  ],
} as const;

export type Initiative = { title: string; tag: string; image: StaticImageData; description: string };

export const initiatives = {
  eyebrow: "What we do",
  title: "Key initiatives",
  description:
    "Comprehensive programs that address different aspects of drug abuse prevention and rehabilitation",
  items: [
    {
      title: "GTECH Initiative",
      tag: "Skill-building",
      image: initiativeGtech,
      description:
        "Empowering youth with technical and artistic skills provides a strong defense against drug abuse by fostering purpose and self-worth. Skill-building programs that enhance problem-solving and emotional regulation create resilience against negative influences. Through workshops and career-oriented camps, young minds stay engaged, responsible, and socially aware, reducing the likelihood of drug dependency.",
    },
    {
      title: "µLearn Movement",
      tag: "Peer leadership",
      image: initiativeMulearn,
      description:
        "Harnessing peer influence, we promote drug prevention through leadership programs like the Near Peer Buddy System. Student-led campaigns, role model initiatives, and peer counseling empower youth. Involvement in school governance, social clubs, and leadership roles fosters accountability, guiding them toward a drug-free lifestyle.",
    },
    {
      title: "Social Engagement",
      tag: "Digital outreach",
      image: initiativeSocial,
      description:
        "Online platforms and social media help combat substance abuse. Instagram, Facebook, and YouTube share impactful stories, videos, and awareness challenges. Games, comics, and virtual communities engage younger audiences. A dedicated website provides drug prevention resources, anonymous reporting, and virtual counseling for easy access to anti-drug support.",
    },
    {
      title: "Community Engagement",
      tag: "Community network",
      image: initiativeCommunity,
      description:
        "A strong community is key to fighting substance abuse. We're building a network of NGOs, law enforcement, schools, and local groups for a safer environment. Parent support groups, neighborhood watch programs, and awareness drives foster collective responsibility, while social clubs, religious institutions, and public figures help spread awareness.",
    },
  ] satisfies Initiative[],
};

export type JourneyItem =
  | { id: string; type: "image"; image: StaticImageData; alt: string }
  | { id: string; type: "video"; videoId: string; title: string };

/** A point on the timeline; `itemId` is the journey item it opens (a film, or a photo such as a press page). */
export type JourneyMilestone = { year: string; itemId: string; title: string; still: StaticImageData };

export const journey = {
  eyebrow: "Our Journey",
  title: "From Darkness to Light",
  description:
    "Witness the transformation journey from the challenges of substance abuse to the empowerment of creative engagement through photos and videos.",
  /** Shown inside the dove-shaped frame. */
  centerpiece: {
    image: heroMarathon,
    alt: "A GTECH Kerala Marathon finisher smiling, a medal ribbon around his neck",
  },
  timeline: [
    { year: "2023", itemId: "marathon-2023", title: "GTech Marathon 2023", still: journeyStill2023 },
    { year: "2024", itemId: "marathon-2024", title: "GTECH Marathon 2024 – Highlights", still: journeyStill2024 },
    { year: "2025", itemId: "marathon-2025", title: "GTech Marathon Highlights 2025", still: journeyStill2025 },
    { year: "2026", itemId: "operation-thunder", title: "Operation Thunder", still: journeyStill2026 },
  ] satisfies JourneyMilestone[],
  items: [
    {
      id: "launch",
      type: "image",
      image: journey01,
      alt: "Dignitaries launching the GTECH Kerala Marathon, powered by IBS Software",
    },
    { id: "marathon-2023", type: "video", videoId: "ZV2Q_06d2Tk", title: "GTech Marathon 2023" },
    {
      id: "press-panchayat",
      type: "image",
      image: journey02,
      alt: "Malayalam newspaper report on the marathon's anti-drug message reaching every panchayat",
    },
    {
      id: "marathon-2024",
      type: "video",
      videoId: "iehEt0AKMRs",
      title: "GTECH Marathon 2024 – Highlights",
    },
    {
      id: "press-website",
      type: "image",
      image: journey03,
      alt: "Newspaper report on the website launch for the GTECH Marathon 2025",
    },
    {
      id: "press-participation",
      type: "image",
      image: journey04,
      alt: "Malayalam newspaper report on thousands joining the G-Tech marathon against drugs",
    },
    {
      id: "press-express",
      type: "image",
      image: journey05,
      alt: "Express News Service report: promotional event for the 2nd edition of the GTECH Marathon",
    },
    {
      id: "marathon-2025",
      type: "video",
      videoId: "6XIAABol4dI",
      title: "GTech Marathon Highlights 2025",
    },
    {
      id: "finish-stage",
      type: "image",
      image: journey06,
      alt: "Runners and guests on stage at the GTECH Marathon finish area",
    },
    {
      id: "operation-thunder",
      type: "image",
      image: operationThunder,
      alt: "Kerala Calling, August 2026: cover story “Mighty Operation Thunder” on the Kerala Excise Department's statewide anti-narcotics drive",
    },
  ] satisfies JourneyItem[],
};

export const pledgeBand = {
  counterLabel: "pledges and counting",
  title: "Take the pledge. Get your certificate.",
  body: "It takes a minute: add your name, accept the five pledge statements, and download a personalised certificate to share. Already pledged? Find it again with the name and email you used.",
  partnersLabel: "An initiative by",
};

export type Partner = {
  key: string;
  name: string;
  logo: StaticImageData;
  /** "colour": the artwork as is. "mono": white artwork shown in the text colour. */
  treatment: "colour" | "mono";
  /** Written out beside the logo when the mark alone doesn't say who it is. */
  caption?: string;
};

/** The logo loop under "Who we are". Logos trimmed by scripts/trim-logos.py. */
export const partners = {
  label: "In partnership with",
  items: [
    {
      key: "kerala-excise",
      name: "Kerala Excise Department",
      logo: partnerKeralaExcise,
      treatment: "colour",
      caption: "Kerala Excise\nDepartment",
    },
    { key: "mayangilla-keralam", name: "Mayangilla Keralam", logo: partnerMayangilla, treatment: "colour" },
    { key: "operation-thunder", name: "Operation Thunder", logo: partnerOperationThunder, treatment: "colour" },
    { key: "gtech", name: "GTech", logo: logoGtech, treatment: "mono" },
    { key: "mulearn", name: "µLearn", logo: logoMulearn, treatment: "mono" },
  ] satisfies Partner[],
};
