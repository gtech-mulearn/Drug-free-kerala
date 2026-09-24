import type { StaticImageData } from "next/image";
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

/* Landing-page copy and media. Edit content here, not in components. */

/** One headline line; `highlight` renders in the brand accent. */
type HeroLine = { text?: string; highlight?: string };

export const hero: { lines: readonly HeroLine[]; lead: string } = {
  lines: [
    { text: "United ", highlight: "against addiction" },
    { text: "For us, for good" },
    { text: "Ending addiction," },
    { highlight: "Towards a greater good" },
  ],
  lead: "Our movement has one objective – to turn intoxicated lives into vibrant communities.",
};

export const about = {
  title: { light: "Towards", bold: "Drug-Free", suffix: "Kerala" },
  body: "A powerful alliance between Gtech and μLearn, empowering youth with factual information about drugs so that they can make informed decisions and live drug-free.",
  video: { id: "hR5dDT7omLM", title: "Towards a Drug-Free Kerala: campaign film" },
} as const;

export const whoWeAre = [
  "We are committed to raising awareness against drug abuse through education, media campaigns, and active community participation.",
  "Our initiative involves sensitization programs for students, parents, and teachers, along with peer mentoring, community engagement, and rehabilitation support.",
] as const;

export const pillars = {
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

export type Initiative = { title: string; image: StaticImageData; description: string };

export const initiatives = {
  description:
    "Comprehensive programs that address different aspects of drug abuse prevention and rehabilitation",
  items: [
    {
      title: "GTECH Initiative",
      image: initiativeGtech,
      description:
        "Empowering youth with technical and artistic skills provides a strong defense against drug abuse by fostering purpose and self-worth. Skill-building programs that enhance problem-solving and emotional regulation create resilience against negative influences. Through workshops and career-oriented camps, young minds stay engaged, responsible, and socially aware, reducing the likelihood of drug dependency.",
    },
    {
      title: "µLearn Movement",
      image: initiativeMulearn,
      description:
        "Harnessing peer influence, we promote drug prevention through leadership programs like the Near Peer Buddy System. Student-led campaigns, role model initiatives, and peer counseling empower youth. Involvement in school governance, social clubs, and leadership roles fosters accountability, guiding them toward a drug-free lifestyle.",
    },
    {
      title: "Social Engagement",
      image: initiativeSocial,
      description:
        "Online platforms and social media help combat substance abuse. Instagram, Facebook, and YouTube share impactful stories, videos, and awareness challenges. Games, comics, and virtual communities engage younger audiences. A dedicated website provides drug prevention resources, anonymous reporting, and virtual counseling for easy access to anti-drug support.",
    },
    {
      title: "Community Engagement",
      image: initiativeCommunity,
      description:
        "A strong community is key to fighting substance abuse. We're building a network of NGOs, law enforcement, schools, and local groups for a safer environment. Parent support groups, neighborhood watch programs, and awareness drives foster collective responsibility, while social clubs, religious institutions, and public figures help spread awareness.",
    },
  ] satisfies Initiative[],
};

export type JourneyItem =
  | { id: string; type: "image"; image: StaticImageData; alt: string; layout: JourneyLayout }
  | { id: string; type: "video"; videoId: string; title: string; layout: JourneyLayout };

/** Bento cell shape: "wide" spans two columns, "tall" two rows. */
export type JourneyLayout = "standard" | "wide" | "tall";

export const journey = {
  title: { light: "Our Journey", bold: "From Darkness to Light" },
  description:
    "Witness the transformation journey from the challenges of substance abuse to the empowerment of creative engagement through photos and videos.",
  items: [
    {
      id: "launch",
      type: "image",
      image: journey01,
      alt: "Dignitaries launching the GTECH Kerala Marathon, powered by IBS Software",
      layout: "standard",
    },
    { id: "marathon-2023", type: "video", videoId: "ZV2Q_06d2Tk", title: "GTech Marathon 2023", layout: "wide" },
    {
      id: "press-panchayat",
      type: "image",
      image: journey02,
      alt: "Malayalam newspaper report on the marathon's anti-drug message reaching every panchayat",
      layout: "tall",
    },
    {
      id: "marathon-2024",
      type: "video",
      videoId: "iehEt0AKMRs",
      title: "GTECH Marathon 2024 – Highlights",
      layout: "wide",
    },
    {
      id: "press-website",
      type: "image",
      image: journey03,
      alt: "Newspaper report on the website launch for the GTECH Marathon 2025",
      layout: "standard",
    },
    {
      id: "press-participation",
      type: "image",
      image: journey04,
      alt: "Malayalam newspaper report on thousands joining the G-Tech marathon against drugs",
      layout: "standard",
    },
    {
      id: "press-express",
      type: "image",
      image: journey05,
      alt: "Express News Service report: promotional event for the 2nd edition of the GTECH Marathon",
      layout: "standard",
    },
    {
      id: "marathon-2025",
      type: "video",
      videoId: "6XIAABol4dI",
      title: "GTech Marathon Highlights 2025",
      layout: "standard",
    },
    {
      id: "finish-stage",
      type: "image",
      image: journey06,
      alt: "Runners and guests on stage at the GTECH Marathon finish area",
      layout: "standard",
    },
  ] satisfies JourneyItem[],
};
