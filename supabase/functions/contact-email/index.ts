import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  role: string | null;
  project_type: string;
  region: string | null;
  message: string;
  preferred_follow_up: string;
  request_evaluation: boolean;
  source_url: string | null;
  notification_email_sent_at: string | null;
  acknowledgement_email_sent_at: string | null;
};

const allowedOrigins = new Set([
  "https://drithinfra.in",
  "https://www.drithinfra.in",
  "http://localhost:5173",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://drithinfra.in",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string | null | undefined) {
  return (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail(
  apiKey: string,
  payload: Record<string, unknown>,
  idempotencyKey: string,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.message === "string" ? body.message : "Resend rejected the email.";
    throw new Error(message);
  }
  return body;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return json(request, { error: "Method not allowed." }, 405);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  const notificationTo = Deno.env.get("CONTACT_NOTIFICATION_TO");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!resendApiKey || !fromEmail || !notificationTo || !supabaseUrl || !serviceRoleKey) {
    return json(request, { error: "Email service configuration is incomplete." }, 500);
  }

  const requestBody = await request.json().catch(() => ({}));
  const contactId = typeof requestBody?.contactId === "string" ? requestBody.contactId.trim() : "";
  if (!contactId.startsWith("contact_") || contactId.length > 100) {
    return json(request, { error: "A valid contact ID is required." }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("contacts")
    .select([
      "id", "name", "email", "phone", "organization", "role",
      "project_type", "region", "message", "preferred_follow_up",
      "request_evaluation", "source_url", "notification_email_sent_at",
      "acknowledgement_email_sent_at",
    ].join(","))
    .eq("id", contactId)
    .maybeSingle();

  if (error) return json(request, { error: "Could not read the contact enquiry." }, 500);
  if (!data) return json(request, { error: "Contact enquiry not found." }, 404);

  const contact = data as ContactRow;
  const safe = {
    name: escapeHtml(contact.name),
    email: escapeHtml(contact.email),
    phone: escapeHtml(contact.phone),
    organization: escapeHtml(contact.organization),
    role: escapeHtml(contact.role),
    projectType: escapeHtml(contact.project_type),
    region: escapeHtml(contact.region),
    message: escapeHtml(contact.message).replaceAll("\n", "<br />"),
    followUp: escapeHtml(contact.preferred_follow_up),
    sourceUrl: escapeHtml(contact.source_url),
  };
  const tagValue = contact.id.replaceAll("-", "_").slice(0, 256);

  try {
    if (!contact.notification_email_sent_at) {
      await sendEmail(resendApiKey, {
        from: fromEmail,
        to: [notificationTo],
        reply_to: contact.email,
        subject: `New ${contact.project_type} enquiry from ${contact.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#082f3f">
            <h1 style="font-size:24px">New Drith Infra enquiry</h1>
            <p><strong>Name:</strong> ${safe.name}</p>
            <p><strong>Email:</strong> ${safe.email}</p>
            <p><strong>Phone:</strong> ${safe.phone}</p>
            <p><strong>Enquiry type:</strong> ${safe.projectType}</p>
            ${safe.organization ? `<p><strong>Organization:</strong> ${safe.organization}</p>` : ""}
            ${safe.role ? `<p><strong>Role:</strong> ${safe.role}</p>` : ""}
            ${safe.region ? `<p><strong>Region:</strong> ${safe.region}</p>` : ""}
            <p><strong>Preferred follow-up:</strong> ${safe.followUp}</p>
            <p><strong>Evaluation requested:</strong> ${contact.request_evaluation ? "Yes" : "No"}</p>
            <h2 style="font-size:18px">Message</h2>
            <p style="line-height:1.6">${safe.message}</p>
            ${safe.sourceUrl ? `<p style="font-size:12px;color:#52717a">Source: ${safe.sourceUrl}</p>` : ""}
          </div>`,
        text: [
          "New Drith Infra enquiry",
          `Name: ${contact.name}`,
          `Email: ${contact.email}`,
          `Phone: ${contact.phone}`,
          `Enquiry type: ${contact.project_type}`,
          `Message: ${contact.message}`,
        ].join("\n"),
        tags: [{ name: "contact_id", value: tagValue }],
      }, `contact-${contact.id}-notification`);

      await supabase.from("contacts").update({
        notification_email_sent_at: new Date().toISOString(),
      }).eq("id", contact.id);
    }

    if (!contact.acknowledgement_email_sent_at) {
      await sendEmail(resendApiKey, {
        from: fromEmail,
        to: [contact.email],
        reply_to: notificationTo,
        subject: "We received your enquiry | Drith Infra",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#082f3f">
            <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#0f7d7a">Drith Infra</p>
            <h1 style="font-size:26px">Thank you, ${safe.name}.</h1>
            <p style="line-height:1.7">We received your ${safe.projectType.toLowerCase()} enquiry. Our team will review it and respond shortly.</p>
            <div style="margin:24px 0;padding:18px;border-radius:14px;background:#eaf9ed">
              <strong>Your message</strong>
              <p style="line-height:1.6;margin-bottom:0">${safe.message}</p>
            </div>
            <p style="line-height:1.7">If you need to add anything, reply directly to this email.</p>
            <p>Drith Infra Private Limited<br />Partner in Sustainable Coastline Infrastructure</p>
          </div>`,
        text: `Thank you, ${contact.name}.\n\nWe received your ${contact.project_type} enquiry and will respond shortly.\n\nYour message:\n${contact.message}\n\nDrith Infra Private Limited`,
        tags: [{ name: "contact_id", value: tagValue }],
      }, `contact-${contact.id}-acknowledgement`);

      await supabase.from("contacts").update({
        acknowledgement_email_sent_at: new Date().toISOString(),
      }).eq("id", contact.id);
    }

    await supabase.from("contacts").update({ email_delivery_error: null }).eq("id", contact.id);
    return json(request, { delivered: true });
  } catch (deliveryError) {
    const message = deliveryError instanceof Error ? deliveryError.message : "Email delivery failed.";
    await supabase.from("contacts").update({
      email_delivery_error: message.slice(0, 1000),
    }).eq("id", contact.id);
    return json(request, { error: message }, 502);
  }
});
