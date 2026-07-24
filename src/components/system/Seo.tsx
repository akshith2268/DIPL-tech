import { useEffect } from "react";
import { assets } from "../../config/assets";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
}

function setMeta(selector: string, key: "name" | "property", name: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(key, name);
    document.head.append(element);
  }
  element.content = value;
}

export function Seo({
  title,
  description,
  path = "/",
  image = assets.projects.coast,
  type = "website",
  robots = "index, follow",
}: SeoProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://drithinfra.in";
  const canonicalUrl = new URL(path, siteUrl).toString();
  const imageUrl = new URL(image, siteUrl).toString();
  const documentTitle = `${title} | Drith Infra`;
  const routeMetadata = {
    canonicalUrl,
    description,
    documentTitle,
    imageUrl,
    robots,
    title,
    type,
  };

  useEffect(() => {
    document.title = documentTitle;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "Drith Infra");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);
    setMeta('meta[name="robots"]', "name", "robots", robots);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
  }, [canonicalUrl, description, documentTitle, imageUrl, robots, title, type]);

  if (!import.meta.env.SSR) return null;

  const serializedMetadata = JSON.stringify(routeMetadata).replace(/</g, "\\u003c");
  return (
    <script
      data-drith-route-seo="true"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: serializedMetadata }}
    />
  );
}
