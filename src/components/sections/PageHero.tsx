import type { ReactNode } from "react";
import { Reveal } from "../ui/Reveal";

export function PageHero({ eyebrow, title, body, aside, className = "" }: { eyebrow: string; title: string; body: string; aside?: ReactNode; className?: string }) {
  return (
    <section className={`page-hero shell ${className}`.trim()}>
      <Reveal className="page-hero__copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p></Reveal>
      {aside ? <Reveal className="page-hero__aside" delay={0.08}>{aside}</Reveal> : null}
    </section>
  );
}

