import { partners } from "../../data";
import { SectionHeading } from "../ui/SectionHeading";

export function Partners() {
  return (
    <section className="section partners-section"><div className="shell"><SectionHeading eyebrow="Research & Innovation" title="Our Knowledge Partners" align="center" /></div><div className="partner-marquee" aria-label="Knowledge partner logos"><div className="partner-marquee__track">{[...partners, ...partners].map((partner, index) => <figure key={`${partner.name}-${index}`}><img src={partner.image} alt={partner.name} loading="lazy" decoding="async" /></figure>)}</div></div></section>
  );
}
