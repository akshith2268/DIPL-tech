import { getSupabaseConfig } from "./supabase/config";

export type AnalyticsEventType = "page_view" | "web_vital";
export type DeviceCategory = "mobile" | "tablet" | "desktop" | "other";

type AnalyticsPayload = {
  eventId: string;
  eventType: AnalyticsEventType;
  path: string;
  pageTitle: string | null;
  sessionId: string;
  referrerDomain: string | null;
  deviceCategory: DeviceCategory;
  navigationMs: number | null;
  lcpMs: number | null;
};

const sessionStorageKey = "drith-analytics-session";
let performanceEventSent = false;

export function isProductionAnalyticsHost(hostname: string) {
  return hostname === "drithinfra.in" || hostname === "www.drithinfra.in";
}

export function sanitizeAnalyticsPath(pathname: string) {
  const path = pathname.split("?")[0]?.slice(0, 200) || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function getDeviceCategory(width: number): DeviceCategory {
  if (!Number.isFinite(width) || width <= 0) return "other";
  if (width <= 767) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function randomUuid() {
  return globalThis.crypto?.randomUUID?.() || "";
}

function getSessionId() {
  try {
    const stored = window.sessionStorage.getItem(sessionStorageKey);
    if (stored) return stored;

    const next = randomUuid();
    if (next) window.sessionStorage.setItem(sessionStorageKey, next);
    return next;
  } catch {
    return randomUuid();
  }
}

function getReferrerDomain() {
  if (!document.referrer) return null;
  try {
    const referrer = new URL(document.referrer);
    return referrer.hostname === window.location.hostname
      ? null
      : referrer.hostname.slice(0, 180);
  } catch {
    return null;
  }
}

function analyticsEnabled() {
  return (
    isProductionAnalyticsHost(window.location.hostname) &&
    !window.location.pathname.startsWith("/admin")
  );
}

async function sendAnalyticsEvent(
  eventType: AnalyticsEventType,
  path: string,
  metrics?: { navigationMs?: number | null; lcpMs?: number | null },
) {
  if (!analyticsEnabled()) return;

  const eventId = randomUuid();
  const sessionId = getSessionId();
  if (!eventId || !sessionId) return;

  const config = getSupabaseConfig();
  const payload: AnalyticsPayload = {
    eventId,
    eventType,
    path: sanitizeAnalyticsPath(path),
    pageTitle: document.title.slice(0, 160) || null,
    sessionId,
    referrerDomain: getReferrerDomain(),
    deviceCategory: getDeviceCategory(window.innerWidth),
    navigationMs: metrics?.navigationMs ?? null,
    lcpMs: metrics?.lcpMs ?? null,
  };

  await fetch(`${config.url}/functions/v1/track-analytics`, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export function trackPageView(pathname: string) {
  return sendAnalyticsEvent("page_view", pathname);
}

export function startPerformanceTracking(initialPath: string) {
  if (!analyticsEnabled() || performanceEventSent) return () => undefined;

  const navigation = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;
  let lcpMs: number | null = null;
  let observer: PerformanceObserver | null = null;
  let timer = 0;

  if ("PerformanceObserver" in window) {
    try {
      observer = new PerformanceObserver((entries) => {
        const latest = entries.getEntries().at(-1) as
          | (PerformanceEntry & { loadTime?: number; renderTime?: number })
          | undefined;
        const value = latest?.renderTime || latest?.loadTime || latest?.startTime;
        if (typeof value === "number" && Number.isFinite(value)) {
          lcpMs = Math.round(value);
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      observer = null;
    }
  }

  const finalize = () => {
    if (performanceEventSent) return;
    performanceEventSent = true;
    observer?.disconnect();
    window.clearTimeout(timer);

    const navigationMs =
      navigation && Number.isFinite(navigation.duration)
        ? Math.round(navigation.duration)
        : null;

    if (navigationMs !== null || lcpMs !== null) {
      void sendAnalyticsEvent("web_vital", initialPath, {
        navigationMs,
        lcpMs,
      });
    }
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") finalize();
  };

  timer = window.setTimeout(finalize, 5000);
  window.addEventListener("pagehide", finalize, { once: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    finalize();
    window.removeEventListener("pagehide", finalize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

