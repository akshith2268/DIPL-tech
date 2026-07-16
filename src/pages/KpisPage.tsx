import { useState } from "react";
import { ContactCta } from "../components/sections/ContactCta";
import { PageHero } from "../components/sections/PageHero";
import { Seo } from "../components/system/Seo";
import { KpiCard } from "../features/kpis/KpiCard";
import { kpiCards } from "../features/kpis/kpiCards";

export default function KpisPage() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  return (
    <>
      <Seo
        title="Key Performance Indicators"
        description="Explore Drith Infra's coastal resilience KPIs across wave performance, carbon value, ecology, lifecycle cost, and market potential."
        path="/kpis"
      />
      <PageHero
        eyebrow="KPIs"
        title="Key performance indicators for nature-aligned coastal infrastructure."
        body="Each card shows the core metric first. Press a card once for more details; press it again to close."
        aside={
          <div className="page-hero__statement">
            <span>Interaction</span>
            <strong>Press card for full KPI context.</strong>
          </div>
        }
      />

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

