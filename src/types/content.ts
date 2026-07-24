export type ProjectSlug = "tatrakshak" | "tatchaitanya" | "tatsagarmitra";

export interface Project {
  slug: ProjectSlug;
  eyebrow: string;
  name: string;
  shortName: string;
  subtitle: string;
  summary: string;
  image: string;
  imageAlt: string;
  tone: "ocean" | "forest" | "sand";
  metrics: ReadonlyArray<{ value: string; label: string }>;
  capabilities: ReadonlyArray<{ title: string; description: string }>;
  seoDescription: string;
}

export interface Recognition {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  date: string;
  expandable?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  quote: string;
  image?: string;
  linkedin: string;
}
