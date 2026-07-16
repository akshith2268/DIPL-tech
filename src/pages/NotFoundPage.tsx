import { Seo } from "../components/system/Seo";
import { ButtonLink } from "../components/ui/ButtonLink";

export default function NotFoundPage() {
  return <section className="not-found shell"><Seo title="Page not found" description="The requested Drith Infra page could not be found." path="/404" /><p className="eyebrow">404 · Off the chart</p><h1>This route does not reach the coast.</h1><p>The page may have moved, or it may have belonged to the old WordPress template library.</p><ButtonLink to="/">Return home</ButtonLink></section>;
}
