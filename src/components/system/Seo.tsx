import { useEffect } from "react";
import { assets } from "../../config/assets";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
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

export function Seo({ title, description, path = "/", image = assets.projects.coast, type = "website" }: SeoProps) {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const canonicalUrl = new URL(path, siteUrl).toString();
    const imageUrl = new URL(image, siteUrl).toString();
    document.title = `${title} | Drith Infra`;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, image, path, title, type]);
  return null;
}
