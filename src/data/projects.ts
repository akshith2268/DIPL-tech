import { assets } from "../config/assets";
import type { Project } from "../types/content";

// Slugs are public URL identifiers and must remain stable.
export const projects: readonly Project[] = [
  {
    slug: "tatrakshak",
    eyebrow: "Protection",
    name: "Project TATRakshak",
    shortName: "TATRakshak",
    subtitle: "Nature-integrated coastal protection",
    summary: "Where we know engineers cant stop disasters, but we can reduce their impact through our knowledge, Innovation and Counsciousness",
    image: assets.projects.coast,
    imageAlt: "Concept rendering of vegetated modular coastal armour protecting a shoreline",
    tone: "ocean",
    metrics: [
      { value: "Protection", label: "Reduces erosion and wave impact." },
      { value: "Carbon", label: "Supports coastal carbon capture." },
      { value: "Regeneration", label: "Enables natural ecosystem recovery." },
      { value: "Resilience", label: "Strengthens long-term coastal defence." },
    ],
    capabilities: [
      { title: "Coastal protection", description: "Modular eco-armour units reduce direct shoreline impact while adapting to local wave climates." },
      { title: "Ecological regeneration", description: "Planting chambers, sediment capture, and root anchoring help coastal vegetation re-establish." },
      { title: "Circular lifecycle", description: "Units are designed for repair, relocation, and redeployment instead of demolition and replacement." },
    ],
    seoDescription: "Discover TATRakshak, Drith Infra's modular nature-aligned coastal protection system for wave attenuation and mangrove regeneration.",
  },
  {
    slug: "tatchaitanya",
    eyebrow: "Awareness",
    name: "Project TATChaitanya",
    shortName: "TATChaitanya",
    subtitle: "Awareness and capacity-building",
    summary: "Where awareness is the first line of defence, empowering communities to protect nature before disasters even begin.",
    image: assets.projects.chaitanya,
    imageAlt: "Community learning session about nature and coastal stewardship",
    tone: "forest",
    metrics: [
      { value: "1 cause", label: "building awareness" },
      { value: "3 areas", label: "Awareness • Learning • Stewardship" },
      { value: "1 outcome", label: "shared sustainability practice" },
      { value: "Open", label: "to institutions and communities" },
    ],
    capabilities: [
      { title: "Awareness", description: "Make coastal risk, erosion, and ecosystem relationships legible to non-specialists." },
      { title: "Learning", description: "Translate Drith Infra's research into workshops, field learning, and institutional programs." },
      { title: "Stewardship", description: "Equip communities to take part in long-term care, observation, and resilience planning." },
    ],
    seoDescription: "Explore TATChaitanya, Drith Infra's coastal awareness and capacity-building initiative for communities, students, and institutions.",
  },
  {
    slug: "tatsagarmitra",
    eyebrow: "Restoration",
    name: "Project TATSagarMitra",
    shortName: "TATSagarMitra",
    subtitle: "Circular coastal restoration",
    summary: "Where waste becomes wisdom and people unite with purpose, coastlines heal and balance is restored naturally.",
    image: assets.projects.sagarMitra,
    imageAlt: "Coastal restoration worker collecting plastic waste near mangroves",
    tone: "sand",
    metrics: [
      { value: "Restore", label: "shorelines and coastal habitat" },
      { value: "Sustain", label: "community-led stewardship" },
      { value: "Divert", label: "plastic away from ocean pathways" },
      { value: "Balance", label: "ecological systems over time" },
      
    ],
    capabilities: [
      { title: "Responsible recovery", description: "Coordinate collection and traceable diversion of plastic in coastal catchments." },
      { title: "Material circularity", description: "Explore engineered applications that keep recovered material in accountable value chains." },
      { title: "Community action", description: "Connect practitioners, partners, and coastal residents around shared restoration outcomes." },
    ],
    seoDescription: "Learn about TATSagarMitra, Drith Infra's circular coastal restoration and responsible plastic recovery initiative.",
  },
];
