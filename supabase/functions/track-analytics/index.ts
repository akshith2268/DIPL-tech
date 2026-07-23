import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://drithinfra.in",
  "https://www.drithinfra.in",
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const countryPattern = /^[A-Z]{2}$/;
const hostnamePattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const deviceCategories = new Set(["mobile", "tablet", "desktop", "other"]);
const eventTypes = new Set(["page_view", "web_vital"]);

function responseHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin)
      ? origin
      : "https://drithinfra.in",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function json(origin: string, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...responseHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

function optionalText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maximumLength) : null;
}

function boundedInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= 0 && rounded <= 600000 ? rounded : null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: responseHeaders(origin) });
  }
  if (request.method !== "POST") {
    return json(origin, { error: "Method not allowed." }, 405);
  }
  if (!allowedOrigins.has(origin)) {
    return json(origin, { error: "Origin is not allowed." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 4096) {
    return json(origin, { error: "Payload is too large." }, 413);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return json(origin, { error: "A JSON payload is required." }, 400);
  }

  const eventId = optionalText(body.eventId, 36);
  const eventType = optionalText(body.eventType, 20);
  const path = optionalText(body.path, 200);
  const sessionId = optionalText(body.sessionId, 36);
  const pageTitle = optionalText(body.pageTitle, 160);
  const referrerDomain = optionalText(body.referrerDomain, 180);
  const deviceCategory = optionalText(body.deviceCategory, 20);
  const navigationMs = boundedInteger(body.navigationMs);
  const lcpMs = boundedInteger(body.lcpMs);

  if (
    !eventId ||
    !uuidPattern.test(eventId) ||
    !eventType ||
    !eventTypes.has(eventType) ||
    !path ||
    !path.startsWith("/") ||
    path.includes("?") ||
    path.startsWith("/admin") ||
    !sessionId ||
    !uuidPattern.test(sessionId) ||
    !deviceCategory ||
    !deviceCategories.has(deviceCategory)
  ) {
    return json(origin, { error: "Analytics payload is invalid." }, 400);
  }

  if (
    referrerDomain &&
    (referrerDomain.includes("/") || !hostnamePattern.test(referrerDomain))
  ) {
    return json(origin, { error: "Referrer domain is invalid." }, 400);
  }

  if (eventType === "web_vital" && navigationMs === null && lcpMs === null) {
    return json(origin, { error: "A performance value is required." }, 400);
  }

  const rawCountry =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    "";
  const normalizedCountry = rawCountry.trim().toUpperCase();
  const countryCode =
    countryPattern.test(normalizedCountry) &&
    normalizedCountry !== "XX" &&
    normalizedCountry !== "T1"
      ? normalizedCountry
      : null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(origin, { error: "Analytics service is not configured." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("analytics_events").insert({
    event_id: eventId,
    event_type: eventType,
    path,
    page_title: pageTitle,
    session_id: sessionId,
    referrer_domain: referrerDomain,
    device_category: deviceCategory,
    country_code: countryCode,
    navigation_ms: eventType === "web_vital" ? navigationMs : null,
    lcp_ms: eventType === "web_vital" ? lcpMs : null,
  });

  if (error && error.code !== "23505") {
    return json(origin, { error: "Analytics event could not be stored." }, 500);
  }

  return new Response(null, {
    status: error?.code === "23505" ? 200 : 202,
    headers: responseHeaders(origin),
  });
});

