import { recognitions } from "../../data";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function RecognitionGrid() {
  return (
    <section className="section recognition-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Milestones of recognition"
          title="Our Journey From Idea to Innovation"
        />
        <div className="recognition-timeline" aria-label="Drith Infra recognition timeline">
          <span className="recognition-timeline__tracker" aria-hidden="true" />
          {recognitions.map((item, index) => (
            <Reveal key={item.title} className="recognition-timeline__item" delay={index * 0.07}>
              <article className="recognition-card">
                <div className="recognition-card__image">
                  <img src={item.image} alt={item.imageAlt} width="1200" height="900" loading="lazy" decoding="async" />
                </div>
                <div className="recognition-card__copy">
                  <p className="eyebrow">{item.date}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
