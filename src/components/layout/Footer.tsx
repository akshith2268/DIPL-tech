import { Link } from "react-router-dom";
import { assets } from "../../config/assets";
import { navigation, projects } from "../../data";
import { Icon, type IconName } from "../ui/Icon";

const exploreIcons: Record<string, IconName> = {
  "/": "home",
  "/projects": "folder",
  "/kpis": "chart",
  "/about": "info",
  "/blogs": "pen",
  "/contact": "phone",
};

const projectIcons: Record<string, IconName> = {
  tatrakshak: "shield",
  tatchaitanya: "bulb",
  tatsagarmitra: "wave",
};

const socialLinks: { label: string; href: string; icon: IconName }[] = [
  { label: "Instagram", href: "https://www.instagram.com/drithinfra/", icon: "instagram" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Drith-Infra-PvtLtd/61581087779751/?rdid=srBC9N69p1BvIXYZ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17GZ9CGTyr%2F",
    icon: "facebook",
  },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/drith-infra-pvt-ltd/", icon: "linkedin" },
];

export function Footer() {
  // Reuses the same navigation/project arrays as Header and project pages.
  // This keeps footer links synchronized with the rest of the website.
  const exploreLinks = [...navigation, { label: "Contact", href: "/contact" }] as const;

  return (
    <footer className="site-footer">
      <div className="shell site-footer__card glass-panel">
        <div className="footer-brand">
          <Link className="brand" to="/" aria-label="Drith Infra home">
            <img src={assets.brand.logo} alt="" width="58" height="58" loading="lazy" decoding="async" />
          </Link>
          <p>Engineering coastal resilience with nature, evidence, and shared responsibility.</p>
          <a href="mailto:drithinfra.pvt@gmail.com">
            <Icon name="mail" width="18" />
            drithinfra.pvt@gmail.com
          </a>
          <span>
            <Icon name="map" width="18" />
            Pimpri-Chinchwad, Pune, India
          </span>
          <div className="footer-socials" aria-label="Social links">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
                <Icon name={social.icon} width="20" height="20" />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-links">
          <p className="footer-label">Explore</p>
          {/* footer-link-card controls these glass navigation pills. */}
          {exploreLinks.map((item) => (
            <Link className="footer-link-card" key={item.href} to={item.href}>
              <span className="footer-link-card__icon">
                <Icon name={exploreIcons[item.href] ?? "arrow"} width="18" />
              </span>
              <span>{item.label}</span>
              <Icon className="footer-link-card__arrow" name="arrow" width="17" />
            </Link>
          ))}
        </div>

        <div className="footer-links">
          <Link className="footer-label footer-label--link" to="/projects">
            Projects
          </Link>
          {/* Project URLs are built from project.slug values in src/data/site.ts. */}
          {projects.map((project) => (
            <Link className="footer-link-card footer-link-card--project" key={project.slug} to={`/projects/${project.slug}`}>
              <span className="footer-link-card__icon">
                <Icon name={projectIcons[project.slug] ?? "leaf"} width="19" />
              </span>
              <span>{project.shortName}</span>
              <Icon className="footer-link-card__arrow" name="arrow" width="18" />
            </Link>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Drith Infra Private Limited.</span>
          <span className="footer-bottom__tagline">
            <Icon name="leaf" width="15" height="15" />
            What Matters The Most? Nature Matters!
          </span>
          <span>Privacy · Accessibility · Responsible claims</span>
        </div>
      </div>
    </footer>
  );
}
