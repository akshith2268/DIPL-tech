import { assets } from "../config/assets";
import type { TeamMember } from "../types/content";

export const team: readonly TeamMember[] = [
  {
    name: "Abhishek Giri",
    role: "Founder & CEO",
    quote: "What Matters The Most? Nature Matters!",
    image: assets.team.abhishekGiri,
    linkedin: "https://www.linkedin.com/in/abhishekgiri9552/",
  },
  {
    name: "Abhilasha Giri",
    role: "Psychological Consultant",
    quote: "When minds follow nature's rhythm, clarity grows and teams move with purpose.",
    image: assets.team.abhilashaGiri,
    linkedin: "https://www.linkedin.com/in/abhilasha-giri-527283325/",
  },
  {
    name: "CA Lalit Badgujar",
    role: "Chief Financial Officer",
    quote: "We don't just evaluate ROI — we evaluate responsibility, resilience, and relevance.",
    image: assets.team.lalitBadgujar,
    linkedin: "https://www.linkedin.com/in/ca-lalit-badgujar/",
  },
  {
    name: "Nikhil Bejjaram",
    role: "Chief Technology Officer",
    quote: "Natural patterns reveal engineering solutions that strengthen structures and regenerate coastlines.",
    image: assets.team.nikhilBejjaram,
    linkedin: "https://www.linkedin.com/in/nikhil-bejjaram-412707282/",
  },
];
