import { useEffect, useRef } from "react";
import { ButtonLink } from "../ui/ButtonLink";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { getKpiImage } from "../../config/assets";

// Homepage-only KPI preview. The full KPI page has the expanded 18-card version.
const previewKpis = [
  {
    value: "16+",
    title: "Coastal & Natural Configurations Tested",
    summary: "Scientific evaluation across natural, conventional, and hybrid ecological shoreline systems.",
  },
  {
    value: "~800-1,200",
    title: "Tons CO2 Reduction per km per Year",
    summary: "Climate-positive infrastructure integrating blue-carbon sequestration and lower-emission materials.",
  },
  {
    value: "80%+",
    title: "Mangrove Survival Rate",
    summary: "Field-validated biological design supporting sapling stability in tidal and wave conditions.",
  },
  {
    value: "25-30%",
    title: "Reduction in Wave Run-Up",
    summary: "Lab-validated Tripot performance dissipating energy instead of reflecting it.",
  },
  {
    value: "30%",
    title: "Lower Embodied CO2",
    summary: "GreenMix material strategy reduces construction-stage emissions while retaining durability.",
  },
  {
    value: "75%",
    title: "Infrastructure Lifecycle Reusability",
    summary: "Repairable, relocatable, and redeployable units designed for circular infrastructure.",
  },
] as const;

const carouselKpis = [...previewKpis, previewKpis[0]] as const;

interface KpiBandProps {
  compactHeading?: boolean;
}

export function KpiBand({ compactHeading = false }: KpiBandProps = {}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const mobileQuery = window.matchMedia("(max-width: 720px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    let resumeTimer: number | undefined;
    let resetTimer: number | undefined;

    const stop = () => {
      window.clearTimeout(timer);
      window.clearTimeout(resumeTimer);
      window.clearTimeout(resetTimer);
    };

    const schedule = (delay = 2400) => {
      stop();
      if (!mobileQuery.matches || motionQuery.matches) return;
      timer = window.setTimeout(() => {
        const cards = Array.from(carousel.children) as HTMLElement[];
        const realCardCount = cards.length - 1;
        if (realCardCount < 2) return;
        let current = 0;
        let closestDistance = Number.POSITIVE_INFINITY;
        cards.forEach((card, index) => {
          const distance = Math.abs(card.offsetLeft - carousel.scrollLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            current = index;
          }
        });
        if (current >= realCardCount) {
          const first = cards[0];
          if (!first) return;
          carousel.scrollTo({ left: first.offsetLeft - carousel.offsetLeft, behavior: "auto" });
          current = 0;
        }
        const nextIndex = current + 1;
        const next = cards[nextIndex];
        if (!next) return;
        carousel.scrollTo({ left: next.offsetLeft - carousel.offsetLeft, behavior: "smooth" });
        if (nextIndex === realCardCount) {
          resetTimer = window.setTimeout(() => {
            const first = cards[0];
            if (first) carousel.scrollTo({ left: first.offsetLeft - carousel.offsetLeft, behavior: "auto" });
            schedule();
          }, 650);
        } else {
          schedule();
        }
      }, delay);
    };

    const pause = () => stop();
    const resume = () => {
      stop();
      resumeTimer = window.setTimeout(() => schedule(), 3200);
    };
    const sync = () => schedule();

    carousel.addEventListener("pointerenter", pause);
    carousel.addEventListener("pointerleave", resume);
    carousel.addEventListener("touchstart", pause, { passive: true });
    carousel.addEventListener("touchend", resume, { passive: true });
    mobileQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    schedule();

    return () => {
      stop();
      carousel.removeEventListener("pointerenter", pause);
      carousel.removeEventListener("pointerleave", resume);
      carousel.removeEventListener("touchstart", pause);
      carousel.removeEventListener("touchend", resume);
      mobileQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section className={`section kpi-preview-section ${compactHeading ? "kpi-preview-section--compact-heading" : ""}`.trim()}>
      <div className="shell">
        {compactHeading ? (
          <SectionHeading title="KPI snapshot" />
        ) : (
          <SectionHeading
            eyebrow="Key performance indicators"
            body="A preview of Drith Infra's KPI framework across wave performance, carbon value, ecological survival, and reusable infrastructure design."
          />
        )}

        <div ref={carouselRef} className="kpi-preview-grid" role="region" aria-label="KPI preview carousel">
          {carouselKpis.map((kpi, index) => {
            const isClone = index === previewKpis.length;
            const sourceIndex = index % previewKpis.length;
            return (
            <Reveal key={`${kpi.title}-${index}`} className={isClone ? "kpi-preview-grid__clone" : ""} delay={sourceIndex * 0.04}>
              <article className="kpi-preview-card" aria-hidden={isClone || undefined}>
                <div className="kpi-preview-card__topline">
                  <span>{String(sourceIndex + 1).padStart(2, "0")}</span>
                  <span>Validated indicator</span>
                </div>
                <div className="kpi-preview-card__body">
                  <figure>
                    <img src={getKpiImage(sourceIndex)} alt="" width="512" height="512" loading="lazy" decoding="async" />
                  </figure>
                  <div className={`kpi-preview-card__metric ${kpi.value.length > 6 ? "kpi-preview-card__metric--compact" : ""}`.trim()}>
                    <strong>{kpi.value}</strong>
                    <h3>{kpi.title}</h3>
                  </div>
                </div>
                <p>{kpi.summary}</p>
              </article>
            </Reveal>
          );})}
        </div>

        <div className="kpi-preview-section__action">
          <ButtonLink to="/kpis">Know more</ButtonLink>
        </div>
      </div>
    </section>
  );
}
