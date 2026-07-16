import { assets } from "../config/assets";
import type { TeamMember } from "../types/content";

export const team: readonly TeamMember[] = [
  {
    name: "Abhishek Giri",
    role: "Founder & CEO",
    quote: "What Matters The Most? Nature Matters!",
    image: assets.team.abhishekGiri,
  },
  {
    name: "Abhilasha Giri",
    role: "Psychological Consultant",
    quote: "When minds follow nature's rhythm, clarity grows and teams move with purpose.",
    image: assets.team.abhilashaGiri,
  },
  {
    name: "CA Lalit Badgujar",
    role: "Chief Financial Officer",
    quote: "We don't just evaluate ROI — we evaluate responsibility, resilience, and relevance.",
    image: assets.team.lalitBadgujar,
  },
  {
    name: "Nikhil Bejjaram",
    role: "Chief Technology Officer",
    quote: "Natural patterns reveal engineering solutions that strengthen structures and regenerate coastlines.",
    image: assets.team.nikhilBejjaram,
  },
];
