import { ContactCta } from "../components/sections/ContactCta";
import { KpiBand } from "../components/sections/KpiBand";
import { Partners } from "../components/sections/Partners";
import { RecognitionGrid } from "../components/sections/RecognitionGrid";
import { Seo } from "../components/system/Seo";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { team } from "../data";

// Cause and Enactment cards in the Vision & Mission section.
const missionCards = [
  {
    label: "Vision",
    body: "To be India's leading provider of sustainable, resilient, and innovative infrastructure solutions for governments, investors, and communities.",
  },
  {
    label: "Enactment",
    body: "To design and implement infrastructure that safeguards coastlines and communities while reducing environmental impact.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="Learn about Drith Infra, its vision, mission, team, impact pillars, KPIs, and recognitions."
        path="/about"
      />

      {/* Vision & Mission section. Text comes from missionCards above. */}
      <section className="section about-mission-section">
        <div className="shell">
          <SectionHeading eyebrow="Vision & Mission" />
          <Reveal className="about-mission-panel glass-panel">
            {missionCards.map((card) => (
              <article key={card.label} className="about-mission-card">
                <p className="eyebrow">{card.label}</p>
                <p>{card.body}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section about-story-section">
        <div className="shell about-story-grid">
          <Reveal className="about-story-copy">
            <p className="eyebrow">Why?</p>
            <h2>Drith Infra</h2>
            <p>
              Drith Infra Pvt. Ltd. is working at the intersection of coastline engineering, climate resilience,
              and sustainable coastline infrastructure.
            </p>
            <ButtonLink to="/kpis" variant="secondary">Know More</ButtonLink>
          </Reveal>

          <Reveal className="about-video-card glass-panel" delay={0.08}>
            <span>Startup Video</span>
            <iframe
              src="https://www.youtube.com/embed/CwxaaeHy6Iw?rel=0&modestbranding=1&playsinline=1"
              title="Drith Infra startup video"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      {/* Team cards are generated from the team array in src/data/site.ts. */}
      <section className="section team-section about-team-section">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Pillars of Impact"
            body="United by a Vision for Sustainable Growth"
          />
          <div className="team-grid">
            {team.map((member, index) => (
              <Reveal key={member.name} className="team-card glass-panel" delay={index * 0.05}>
                {member.image ? (
                  <img src={member.image} alt={member.name} width="600" height="600" loading="lazy" decoding="async" />
                ) : (
                  <div className="team-card__initials" aria-hidden="true">
                    {member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </div>
                )}
                <span>{member.role}</span>
                <h3>{member.name}</h3>
                <p>“{member.quote}”</p>
                <ButtonLink to="/about" variant="text">Know Me</ButtonLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <KpiBand />
      <RecognitionGrid />
      <Partners />
      <ContactCta />
    </>
  );
}
