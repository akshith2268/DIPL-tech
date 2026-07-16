import { useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import { assets } from "../../config/assets";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface ComparisonItem {
  title: string;
  before: string;
  beforeAlt: string;
  after: string;
  afterAlt: string;
}

const comparisons: readonly ComparisonItem[] = [
  {
    title: "From hard defence to living protection",
    before: assets.comparisons.coastBefore,
    beforeAlt: "Conventional concrete coastal barriers beside a grey urban shoreline",
    after: assets.comparisons.coastAfter,
    afterAlt: "Nature-integrated coastal barriers supporting mangrove growth",
  },
  {
    title: "From infrastructure to a shared ecosystem",
    before: assets.comparisons.coastAfter,
    beforeAlt: "Nature-integrated coastal barriers supporting young mangroves",
    after: assets.comparisons.natureAfter,
    afterAlt: "Regenerated mangrove coastline with community access and healthy blue water",
  },
];

function ComparisonSlider({ item, index }: { item: ComparisonItem; index: number }) {
  const [position, setPosition] = useState(50);
  const style = { "--compare-position": `${position}%` } as CSSProperties;
  const updatePosition = (event: FormEvent<HTMLInputElement>) => setPosition(Number(event.currentTarget.value));
  const followPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" && event.buttons !== 1) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextPosition = ((event.clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.round(Math.min(95, Math.max(5, nextPosition))));
  };

  return (
    <Reveal className="comparison-card glass-panel" delay={index * 0.08}>
      <div className="comparison-stage" style={style} onPointerEnter={followPointer} onPointerMove={followPointer}>
        <img className="comparison-stage__image comparison-stage__image--after" src={item.after} alt={item.afterAlt} width="1024" height="1024" loading="lazy" decoding="async" />
        <img className="comparison-stage__image comparison-stage__image--before" src={item.before} alt={item.beforeAlt} width="1024" height="1024" loading="lazy" decoding="async" />

        <span className="comparison-label comparison-label--before">Before</span>
        <span className="comparison-label comparison-label--after">After</span>

        <input
          className="comparison-slider"
          type="range"
          min="5"
          max="95"
          value={position}
          aria-label={`Compare before and after: ${item.title}`}
          aria-valuetext={`${position} percent before image visible`}
          onInput={updatePosition}
          onChange={updatePosition}
        />

        <div className="comparison-handle" aria-hidden="true">
          <span>
            <svg viewBox="0 0 24 24"><path d="m14 7-5 5 5 5" /></svg>
            <svg viewBox="0 0 24 24"><path d="m10 7 5 5-5 5" /></svg>
          </span>
        </div>
      </div>
    </Reveal>
  );
}

export function ComparisonShowcase() {
  return (
    <section className="section comparison-section">
      <div className="shell">
        <SectionHeading
          title="See how a shoreline can change."
        />
        <div className="comparison-grid">
          {comparisons.map((item, index) => (
            <ComparisonSlider key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
