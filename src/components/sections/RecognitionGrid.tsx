import { useEffect, useRef, useState } from "react";
import { recognitions } from "../../data";
import type { Recognition } from "../../types/content";
import { Reveal } from "../ui/Reveal";
import { Icon } from "../ui/Icon";
import { SectionHeading } from "../ui/SectionHeading";

export function RecognitionGrid() {
  const [openRecognition, setOpenRecognition] = useState<Recognition | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!openRecognition) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenRecognition(null);
      window.requestAnimationFrame(() => lastTrigger.current?.focus());
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [openRecognition]);

  function closeRecognition() {
    setOpenRecognition(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  return (
    <>
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
                    {item.expandable ? (
                      <button
                        className="recognition-card__expand"
                        type="button"
                        aria-label={`Expand ${item.title} image`}
                        onClick={(event) => {
                          lastTrigger.current = event.currentTarget;
                          setOpenRecognition(item);
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.imageAlt}
                          width="1200"
                          height="900"
                          loading="lazy"
                          decoding="async"
                        />
                        <span>
                          <Icon name="expand" width="16" height="16" />
                          Expand image
                        </span>
                      </button>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        width="1200"
                        height="900"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
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

      {openRecognition ? (
        <div
          className="recognition-lightbox"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRecognition();
          }}
        >
          <div
            className="recognition-lightbox__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recognition-lightbox-title"
          >
            <button
              autoFocus
              className="recognition-lightbox__close"
              type="button"
              aria-label="Close expanded recognition image"
              onClick={closeRecognition}
            >
              <Icon name="close" width="22" height="22" />
            </button>
            <header>
              <p className="eyebrow">{openRecognition.date}</p>
              <h2 id="recognition-lightbox-title">{openRecognition.title}</h2>
            </header>
            <img
              src={openRecognition.image}
              alt={openRecognition.imageAlt}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
