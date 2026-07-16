import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/layout/SiteLayout";
import { RouteFallback } from "./components/system/RouteFallback";

// Website route map. If a public URL changes, update it here and then update
// matching links in src/data/site.ts, Header, Footer, and button links.
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const KpisPage = lazy(() => import("./pages/KpisPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Admin is outside SiteLayout so it can use its own private layout/header. */}
        <Route path="admin" element={<AdminPage />} />
        {/* Public pages share Header, Footer, SEO schema, and scroll reset through SiteLayout. */}
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectSlug" element={<ProjectDetailPage />} />
          <Route path="kpis" element={<KpisPage />} />
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="blogs/:articleSlug" element={<ArticlePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
