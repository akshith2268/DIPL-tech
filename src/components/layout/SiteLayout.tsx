import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnalyticsTracker } from "../system/AnalyticsTracker";
import { OrganizationSchema } from "../system/OrganizationSchema";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteLayout() {
  const location = useLocation();

  // Reset the scroll position whenever the route changes.
  // The braces matter: useEffect must not return window.scrollTo's result.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  // main#main-content is the shared wrapper for all public page content.
  // Header and Footer are kept here so individual pages stay focused on content.
  return (
    <>
      <AnalyticsTracker />
      <OrganizationSchema />
      <Header />
      <main id="main-content"><Outlet /></main>
      <Footer />
    </>
  );
}
