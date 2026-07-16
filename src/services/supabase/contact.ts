import { getSupabaseConfig } from "./config";

type ContactInsert = {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  role?: string;
  projectType: string;
  region?: string;
  message: string;
  preferredFollowUp: string;
  requestEvaluation: boolean;
  subscribe: boolean;
  consent: boolean;
};

type SupabaseError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Creates a unique contact row id. The contact_ prefix makes these rows easy
// to identify when looking directly inside Supabase.
function createContactId() {
  if (globalThis.crypto?.randomUUID) {
    return `contact_${globalThis.crypto.randomUUID()}`;
  }

  return `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function optionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function insertContactSubmission(contact: ContactInsert) {
  const config = getSupabaseConfig();

  const payload = {
    // Database column names are snake_case. The React form uses camelCase,
    // so this object is the translation layer between UI and Supabase.
    id: createContactId(),
    name: contact.name.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
    organization: optionalText(contact.organization),
    role: optionalText(contact.role),
    project_type: contact.projectType,
    region: optionalText(contact.region),
    message: contact.message.trim(),
    preferred_follow_up: contact.preferredFollowUp,
    request_evaluation: contact.requestEvaluation,
    subscribe: contact.subscribe,
    consent: contact.consent,
    source_url: window.location.href,
    status: "NEW",
    metadata: {
      submitted_from: "apps/web",
      user_agent: window.navigator.userAgent,
    },
    updated_at: new Date().toISOString(),
  };

  const response = await fetch(`${config.url}/rest/v1/contacts`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as SupabaseError;
    throw new Error(errorBody.message || "Supabase contact insert failed.");
  }

  // Email delivery is handled server-side so the Resend API key never reaches
  // the browser. A temporary email failure must not lose a valid enquiry.
  let emailSent = false;

  try {
    const emailResponse = await fetch(`${config.url}/functions/v1/contact-email`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactId: payload.id }),
    });

    emailSent = emailResponse.ok;
  } catch {
    // The contact row is already stored. The Edge Function can be retried from
    // Supabase without asking the visitor to submit their enquiry again.
    emailSent = false;
  }

  return { contactId: payload.id, emailSent };
}
