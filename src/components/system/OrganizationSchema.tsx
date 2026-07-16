import { assets } from "../../config/assets";

export function OrganizationSchema() {
  const baseUrl = import.meta.env.VITE_SITE_URL || "https://drithinfra.in";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Drith Infra Private Limited",
    url: baseUrl,
    logo: `${baseUrl}${assets.brand.logo}`,
    email: "drithinfra.pvt@gmail.com",
    address: { "@type": "PostalAddress", addressLocality: "Pimpri-Chinchwad", addressRegion: "Maharashtra", addressCountry: "IN" },
    description: "Drith Infra develops nature-aligned coastal infrastructure and awareness programs for resilient communities.",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
