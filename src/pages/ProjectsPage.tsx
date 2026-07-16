import { ContactCta } from "../components/sections/ContactCta";
import { KpiBand } from "../components/sections/KpiBand";
import { Partners } from "../components/sections/Partners";
import { ProjectCard } from "../components/sections/ProjectCard";
import { Seo } from "../components/system/Seo";
import { projects } from "../data";

export default function ProjectsPage() {
  return (
    <>
      <Seo
        title="Projects"
        description="Explore Drith Infra's connected coastal protection, awareness, and restoration projects."
        path="/projects"
      />

      {/* Projects listing page. Cards are generated from src/data/site.ts and rendered by ProjectCard. */}
      <section className="section projects-showcase-section">
        <div className="shell">
          <header className="projects-showcase-heading">
            <h1>Our Projects</h1>
          </header>

          <div className="projects-showcase-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} compact />
            ))}
          </div>
        </div>
      </section>

      <KpiBand compactHeading />
      <Partners />
      <ContactCta />
    </>
  );
}
