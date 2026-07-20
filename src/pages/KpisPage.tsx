import { useState } from "react";
import { ContactCta } from "../components/sections/ContactCta";
import { Seo } from "../components/system/Seo";
import { KpiCard } from "../features/kpis/KpiCard";
import { kpiCards } from "../features/kpis/kpiCards";
import "../styles/kpis-heading.css";

export default function KpisPage() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  return (
    <>
      <Seo
        title="Key Performance Indicators"
        description="Explore Drith Infra's coastal resilience KPIs across wave performance, carbon value, ecology, lifecycle cost, and market potential."
        path="/kpis"
      />
      <section className="kpis-page-heading shell" aria-labelledby="kpis-page-title">
        <h1 id="kpis-page-title">Key Performance Indicators</h1>
      </section>

      {/* Interactive KPI grid. Clicking a card toggles the kpi-flip-card--open CSS state. */}
      <section className="section kpis-showcase">
        <div className="shell kpi-card-grid">
          {kpiCards.map((kpi, index) => (
            <KpiCard
              key={`${kpi.value}-${kpi.title}`}
              index={index}
              isOpen={openCard === index}
              kpi={kpi}
              onToggle={() => setOpenCard((current) => (current === index ? null : index))}
            />
          ))}
        </div>
      </section>

      <ContactCta />
    </>
  );
}

