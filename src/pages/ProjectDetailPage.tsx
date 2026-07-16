import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ContactCta } from "../components/sections/ContactCta";
import { KpiBand } from "../components/sections/KpiBand";
import { Seo } from "../components/system/Seo";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Icon } from "../components/ui/Icon";
import { Reveal } from "../components/ui/Reveal";
import { assets } from "../config/assets";
import { projects } from "../data";

type Project = (typeof projects)[number];

const tatrakshakRoles = [
  {
    title: "Coastal Protection",
    label: "Engineering Role",
    icon: "shield" as const,
    summary: "Reduces erosion and absorbs wave energy through modular coastline protection.",
    details:
      "TATRakshak is designed to reduce coastline erosion, absorb wave energy, and support shorelines exposed to storm surges, tidal action, and long-term coastal vulnerability.",
  },
  {
    title: "Ecological Regeneration",
    label: "Natural Role",
    icon: "leaf" as const,
    summary: "Creates conditions for coastline ecosystems to recover over time.",
    details:
      "The system works with nature by supporting sediment stability, mangrove growth, and ecological recovery, turning protection into a living infrastructure response.",
  },
  {
    title: "Lifecycle & Circular Value",
    label: "System Role",
    icon: "wave" as const,
    summary: "Connects durability, reuse, and low-carbon coastline resilience.",
    details:
      "Its modular lifecycle approach is intended to reduce material waste, support adaptive deployment, and keep long-term infrastructure decisions accountable.",
  },
] as const;

const tatrakshakReports = ["Feasibility Report", "DCF Valuation Report"] as const;

const sdgGoals = [
  { id: "09", title: "Industry, Innovation and Infrastructure", image: assets.sdgs.industry },
  { id: "11", title: "Sustainable Cities and Communities", image: assets.sdgs.cities },
  { id: "13", title: "Climate Action", image: assets.sdgs.climate },
  { id: "14", title: "Life Below Water", image: assets.sdgs.water },
] as const;

type SdgGoal = (typeof sdgGoals)[number];

export default function ProjectDetailPage() {
  const { projectSlug } = useParams();
  const project = projects.find((item) => item.slug === projectSlug);
  if (!project) return <Navigate to="/projects" replace />;

  if (project.slug === "tatrakshak") return <TatrakshakDetail project={project} />;

  return <SimpleProjectDetail project={project} />;
}

function SimpleProjectDetail({ project }: { project: Project }) {
  return (
    <>
      <Seo title={project.name} description={project.seoDescription} path={`/projects/${project.slug}`} image={project.image} />

      <section className="section project-simple-section">
        <div className="shell project-simple-hero glass-panel">
          <Reveal className="project-simple-hero__copy">
            <p className="eyebrow">{project.eyebrow} · Drith Infra project</p>
            <h1>{project.name}</h1>
            <p className="project-simple-hero__lead">{project.summary}</p>
          </Reveal>
          <Reveal className="project-simple-hero__media" delay={0.08}>
            <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" />
          </Reveal>
        </div>
      </section>

      <section className="section project-simple-section project-simple-section--tight">
        <div className="shell project-simple-grid">
          <Reveal className="project-simple-panel glass-panel">
            <p className="eyebrow">Why it exists</p>
            <h2>{project.subtitle}</h2>
            <p>{project.seoDescription}</p>
          </Reveal>

          <div className="project-simple-list">
            {project.capabilities.map((capability, index) => (
              <Reveal key={capability.title} className="project-simple-card glass-panel" delay={index * 0.05}>
                <span>0{index + 1}</span>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProjectMetrics project={project} />
      <ContactCta />
    </>
  );
}

function TatrakshakDetail({ project }: { project: Project }) {
  const [openRole, setOpenRole] = useState<string | null>(null);
  const [openSdg, setOpenSdg] = useState<SdgGoal | null>(null);

  useEffect(() => {
    if (!openSdg) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSdg(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [openSdg]);

  return (
    <>
      <Seo
        title={project.name}
        description={project.seoDescription}
        path={`/projects/${project.slug}`}
        image={assets.projects.tatrakshakCoast}
      />

      <section className="section project-simple-section">
        <div className="shell project-simple-hero project-simple-hero--tat glass-panel">
          <Reveal className="project-simple-hero__copy">
            <p className="eyebrow">Project</p>
            <h1>TATRakshak</h1>
            <p className="project-simple-hero__lead">
              TATRakshak is a sustainable coastal protection system that defends shorelines while restoring natural ecosystems. It reimagines coastal infrastructure by working with nature — not against it — creating protection that strengthens over time.
            </p>
          </Reveal>
          <Reveal className="project-simple-hero__media project-simple-hero__media--video" delay={0.08}>
            <video autoPlay muted loop playsInline preload="auto" poster={assets.projects.tatrakshakCoast}>
              <source src={assets.videos.tatrakshakHero} type="video/mp4" />
            </video>
          </Reveal>
        </div>
      </section>

      <section className="section project-simple-section project-simple-section--tight">
        <div className="shell project-simple-grid">
          <Reveal className="project-simple-panel glass-panel">
            <p className="eyebrow">Engineering Coastal Protection for Long-Term Resilience</p>
            <h2>Why TATRakshak?</h2>
            <p>
              TATRakshak is a nature-aligned coastline protection system designed to reduce erosion, absorb wave energy, and regenerate coastline ecosystems over time. It rethinks conventional coastline defence by combining engineering strength, ecological intelligence, and lifecycle sustainability into a single deployable system.
            </p>
          </Reveal>

          <Reveal className="project-simple-image glass-panel" delay={0.08}>
            <img src={assets.projects.tatrakshakCoast} alt="Flood affected coastline showing the need for resilient protection" loading="lazy" decoding="async" />
          </Reveal>
        </div>
      </section>

      <section className="section project-simple-section project-simple-section--tight">
        <div className="shell">
          <Reveal className="project-simple-heading">
            <p className="eyebrow">Click for more details</p>
            <h2>How TATRakshak works.</h2>
          </Reveal>

          <div className="project-expand-grid">
            {tatrakshakRoles.map((role, index) => {
              const isOpen = openRole === role.title;
              return (
                <Reveal key={role.title} delay={index * 0.05}>
                  <button
                    className={`project-expand-card glass-panel ${isOpen ? "project-expand-card--open" : ""}`.trim()}
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenRole(isOpen ? null : role.title)}
                  >
                    <span className="project-expand-card__index">0{index + 1}</span>
                    <Icon name={role.icon} width="28" />
                    <span className="eyebrow">{role.label}</span>
                    <strong>{role.title}</strong>
                    <span className="project-expand-card__summary">{role.summary}</span>
                    <span className="project-expand-card__details">{role.details}</span>
                    <span className="project-expand-card__hint">{isOpen ? "Click to close" : "Click to read more"}</span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section project-simple-section project-simple-section--tight">
        <div className="shell project-simple-grid">
          <Reveal className="project-simple-panel glass-panel">
            <p className="eyebrow">Taking action for sustainable development</p>
            <h2>SDG Goals</h2>
            <p>
             Our approach directly contributes to global sustainability goals.
            </p>
            <div className="sdg-gallery" aria-label="Sustainable Development Goals">
              {sdgGoals.map((goal) => (
                <button
                  key={goal.id}
                  className="sdg-gallery__item"
                  type="button"
                  aria-label={`Enlarge SDG ${goal.id}: ${goal.title}`}
                  aria-haspopup="dialog"
                  onClick={() => setOpenSdg(goal)}
                >
                  <img src={goal.image} alt={`SDG ${goal.id}: ${goal.title}`} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </Reveal>

          <div className="project-simple-list project-simple-list--reports">
            {tatrakshakReports.map((report, index) => (
              <Reveal key={report} className="project-simple-card glass-panel" delay={index * 0.05}>
                <span>0{index + 1}</span>
                <h3>{report}</h3>
                <ButtonLink to="/contact" variant="text">Request access</ButtonLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {openSdg ? (
        <div
          className="sdg-lightbox"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpenSdg(null);
          }}
        >
          <div className="sdg-lightbox__dialog" role="dialog" aria-modal="true" aria-labelledby="sdg-lightbox-title">
            <button
              autoFocus
              className="sdg-lightbox__close"
              type="button"
              aria-label="Close expanded SDG image"
              onClick={() => setOpenSdg(null)}
            >
              <Icon name="close" width="22" />
            </button>
            <img src={openSdg.image} alt={`SDG ${openSdg.id}: ${openSdg.title}`} />
            <p className="eyebrow">SDG {openSdg.id}</p>
            <h2 id="sdg-lightbox-title">{openSdg.title}</h2>
          </div>
        </div>
      ) : null}

      <KpiBand />
      <ContactCta />
    </>
  );
}

function ProjectMetrics({ project }: { project: Project }) {
  return (
    <section className="section project-simple-section project-simple-section--tight">
      <div className="shell project-simple-metrics glass-panel">
        {project.metrics.map((metric) => (
          <div key={metric.value + metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
