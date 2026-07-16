import { ContactCta } from "../components/sections/ContactCta";
import { Seo } from "../components/system/Seo";
import { Reveal } from "../components/ui/Reveal";
import { assets } from "../config/assets";

const blogPosts = [
  {
    title: "Me as an Engineer",
    image: assets.articles.engineer,
    alt: "Abhishek Giri using a surveying instrument during field work",
    author: "Abhishek Giri",
    date: "16 March 2025",
    time: "10:30 AM",
    place: "Pune, India",
    category: "Field Note",
    body:
      "Engineering begins when I stop looking at a site as a drawing and start reading it as a living system. Every measurement, level, and observation teaches me how infrastructure must respond to land, water, people, and time.",
  },
  {
    title: "Me as a CEO",
    image: assets.articles.ceo,
    alt: "Drith Infra presenting coastline resilience work in a meeting room",
    author: "Abhishek Giri",
    date: "16 March 2025",
    time: "04:30 PM",
    place: "Pune, India",
    category: "Leadership Note",
    body:
      "Being a CEO at this stage means carrying the vision into every room with clarity and responsibility. Drith Infra is not just building a product; it is building trust around nature-aligned coastal infrastructure.",
  },
] as const;

export default function BlogsPage() {
  return (
    <>
      <Seo title="Blog" description="Compact field notes and founder reflections from Drith Infra." path="/blogs" />

      <section className="section blog-showcase-section">
        <div className="shell">
          <header className="blog-showcase-heading">
            <h1>Blog</h1>
          </header>

          <div className="blog-card-grid">
            {blogPosts.map((post, index) => (
              <Reveal key={post.title} className="blog-card glass-panel" delay={index * 0.06}>
                <div className="blog-card__image">
                  <img src={post.image} alt={post.alt} width="1600" height="1000" loading="lazy" decoding="async" />
                </div>
                <div className="blog-card__copy">
                  <p className="eyebrow">{post.category}</p>
                  <h2>{post.title}</h2>
                  <div className="blog-card__meta" aria-label="Blog metadata">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                    <span>{post.time}</span>
                    <span>{post.place}</span>
                  </div>
                  <p>{post.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
