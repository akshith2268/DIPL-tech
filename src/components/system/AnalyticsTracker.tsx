import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  startPerformanceTracking,
  trackPageView,
} from "../../services/analytics";

export function AnalyticsTracker() {
  const location = useLocation();
  const initialPath = useRef(location.pathname);

  useEffect(() => {
    void trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(
    () => startPerformanceTracking(initialPath.current),
    [],
  );

  return null;
}

