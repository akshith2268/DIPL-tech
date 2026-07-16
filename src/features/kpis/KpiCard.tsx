import { Reveal } from "../../components/ui/Reveal";
import { getKpiImage } from "../../config/assets";
import type { kpiCards } from "./kpiCards";

type KpiCardData = (typeof kpiCards)[number];

type KpiCardProps = {
  index: number;
  isOpen: boolean;
  kpi: KpiCardData;
  onToggle: () => void;
};

export function KpiCard({ index, isOpen, kpi, onToggle }: KpiCardProps) {
  return (
    <Reveal delay={index * 0.025}>
      <article
        className={`kpi-flip-card kpi-flip-card--${kpi.icon} ${isOpen ? "kpi-flip-card--open" : ""}`.trim()}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Close" : "Read more about"} ${kpi.title}`}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
      >
        <figure className="kpi-flip-card__visual">
          <img src={getKpiImage(index)} alt={`${kpi.title} KPI illustration`} width="512" height="512" loading="lazy" decoding="async" />
        </figure>
        <span className="kpi-flip-card__index">{String(index + 1).padStart(2, "0")}</span>
        <strong>{kpi.value}</strong>
        <h2>{kpi.title}</h2>
        <p>{kpi.summary}</p>
        <div className="kpi-flip-card__read-more">
          <span>{isOpen ? "Read less" : "Read more"}</span>
          <span aria-hidden="true" className="kpi-flip-card__read-more-dot" />
        </div>
        <div className="kpi-flip-card__details" aria-label={`Read more about ${kpi.title}`}>
          <h3>{kpi.title}</h3>
          <ul>
            {kpi.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
          <span>Read less</span>
        </div>
      </article>
    </Reveal>
  );
}
