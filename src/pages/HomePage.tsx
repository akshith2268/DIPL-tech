import { ButtonLink } from "../components/ui/ButtonLink";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ContactCta } from "../components/sections/ContactCta";
import { ComparisonShowcase } from "../components/sections/ComparisonShowcase";
import { KpiBand } from "../components/sections/KpiBand";
import { Partners } from "../components/sections/Partners";
import { RecognitionGrid } from "../components/sections/RecognitionGrid";
import { assets } from "../config/assets";
import { projects } from "../data";
import { Seo } from "../components/system/Seo";

const homepageProjectOrder = ["tatchaitanya", "tatrakshak", "tatsagarmitra"] as const;
const homepageProjects = homepageProjectOrder.map((slug) => projects.find((project) => project.slug === slug)!);

export default function HomePage() {
  return (
    <>
      <Seo
        title="Nature-Aligned Coastal Infrastructure"
        description="Drith Infra combines engineering, ecological intelligence, and coastal awareness to build resilient shorelines and communities."
      />

      {/* Full-screen landing section. CSS classes starting with home-video-hero control the video, overlay, and text layout. */}
      <section className="home-video-hero">
        <video
          className="home-video-hero__media"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={assets.projects.coast}
          width="1920"
          height="1080"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={assets.videos.homeHero} type="video/mp4" />
        </video>
        <div className="home-video-hero__overlay" aria-hidden="true" />
        <div className="home-video-hero__content home-video-hero__content--animated shell">
          <h1 className="home-video-hero__wordmark">Drith Infra Private Limited</h1>
          <p className="eyebrow">Partner in Sustainable Coastline Infrastructure</p>
        
          <div className="button-row">
            <ButtonLink to="/projects" variant="secondary">Our Projects</ButtonLink>
            <ButtonLink to="/contact" variant="secondary">Contact Us</ButtonLink>
          </div>
        </div>
      </section>

      {/* Homepage project cards are generated from the projects array in src/data/site.ts. */}
      <section className="section principles-section">
        <div className="shell">
          <SectionHeading title="Our Projects" />
          <div className="principle-grid">
            {homepageProjects.map((project, index) => (
              <Reveal key={project.slug} className="principle-card glass-panel" delay={index * 0.06}>
                <span>0{index + 1}</span>
                <img className="principle-card__image" src={project.image} alt={project.imageAlt} width="1600" height="1000" loading="lazy" decoding="async" />
                <h3>{project.shortName}</h3>
                <p className="eyebrow">{project.eyebrow}</p>
                <p>{project.summary}</p>
                <ButtonLink
                  to={`/projects/${project.slug}`}
                  variant="text"
                  className="project-glass-button"
                  showArrow={false}
                >
                  View project
                </ButtonLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ComparisonShowcase />

      {/* Founder card. Visual styling comes from founder-section and founder-card CSS classes. */}
      <section className="section founder-section">
        <div className="shell founder-card">
          <Reveal className="founder-card__portrait">
            <img src={assets.team.abhishekGiri} alt="Abhishek Giri, founder and CEO of Drith Infra" width="600" height="600" loading="lazy" decoding="async" />
          </Reveal>
          <Reveal className="founder-card__copy" delay={0.08}>
            <p className="eyebrow">Founder and CEO</p>
            <blockquote>“What Matters the Most? Nature Matters!”</blockquote>
            <p>
              Leading Drith Infra with a mission to integrate engineering precision with ecological intelligence — building sustainable coastline infrastructure that protects communities while restoring nature.
            </p>
            <div className="founder-card__actions">
              <ButtonLink to="/about" variant="secondary">Meet the team</ButtonLink>
              <a
                className="button button--secondary"
                href="https://www.linkedin.com/in/abhishekgiri9552/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Abhishek Giri's LinkedIn profile"
              >
                <span>LinkedIn</span>
                <span className="founder-card__button-arrow" aria-hidden="true">â†’</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <RecognitionGrid />
      {/* KPI evidence follows recognition milestones in the homepage story. */}
      <KpiBand />
      <Partners />
      <ContactCta />
    </>
  );
}
