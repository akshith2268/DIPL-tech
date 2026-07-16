import type { Project } from "../../types/content";
import { ButtonLink } from "../ui/ButtonLink";
import { Reveal } from "../ui/Reveal";

export function ProjectCard({
  project,
  index,
  detailed = false,
  compact = false,
}: {
  project: Project;
  index: number;
  detailed?: boolean;
  compact?: boolean;
}) {
  const metrics = project.metrics.slice(0, compact ? 2 : detailed ? 4 : 2);

  // Shared project card used on the homepage, projects page, and project details.
  // `compact` makes the card grid-style; `detailed` allows more metrics.
  return (
    <Reveal className={`project-card project-card--${project.tone} ${compact ? "project-card--compact glass-panel" : ""} ${!compact && index % 2 ? "project-card--reverse" : ""}`.trim()}>
      <div className="project-card__image">
        <img src={project.image} alt={project.imageAlt} width="900" height="620" loading="lazy" decoding="async" />
      </div>
      <div className="project-card__copy">
        <p className="eyebrow">0{index + 1} · {project.eyebrow}</p>
        <h2>{project.name}</h2>
        <p className="project-card__subtitle">{project.subtitle}</p>
        <p>{project.summary}</p>
        <div className="project-card__metrics">
          {metrics.map((metric) => (
            <div key={metric.value + metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
        <ButtonLink to={`/projects/${project.slug}`} variant="secondary" className="project-glass-button">Explore project</ButtonLink>
      </div>
    </Reveal>
  );
}
