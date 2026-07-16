import { getSupabaseConfig } from "./config";

export type AdminContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  role: string | null;
  projectType: string;
  region: string | null;
  message: string;
  preferredFollowUp: string;
  requestEvaluation: boolean;
  subscribe: boolean;
  status: string;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
};

type AuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { email?: string };
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

type SupabaseContactRow = {
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
  subscribe: boolean;
  status: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

export type AdminContactsPage = {
  contacts: AdminContact[];
  total: number;
};

async function readError(response: Response) {
  const body = (await response.json().catch(() => ({}))) as AuthTokenResponse & SupabaseError;
  return body.error_description || body.message || body.msg || body.error || "Supabase request failed.";
}

function mapContact(row: SupabaseContactRow): AdminContact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    organization: row.organization,
    role: row.role,
    projectType: row.project_type,
    region: row.region,
    message: row.message,
    preferredFollowUp: row.preferred_follow_up,
    requestEvaluation: row.request_evaluation,
    subscribe: row.subscribe,
    status: row.status,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (!response.ok) throw new Error(await readError(response));

  const body = (await response.json()) as AuthTokenResponse;
  if (!body.access_token || !body.refresh_token) {
    throw new Error("Supabase did not return an admin session.");
  }

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + ((body.expires_in ?? 3600) * 1000),
    email: body.user?.email || email.trim(),
  };
}

export async function signOutAdmin(session: AdminSession) {
  const config = getSupabaseConfig();
  await fetch(`${config.url}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: config.anonKey, Authorization: `Bearer ${session.accessToken}` },
  }).catch(() => undefined);
}

export async function fetchAdminContacts(
  accessToken: string,
  page = 1,
  pageSize = 10,
): Promise<AdminContactsPage> {
  const config = getSupabaseConfig();
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const offset = (safePage - 1) * safePageSize;
  const select = [
    "id", "name", "email", "phone", "organization", "role", "project_type", "region",
    "message", "preferred_follow_up", "request_evaluation", "subscribe", "status",
    "source_url", "created_at", "updated_at",
  ].join(",");

  const query = new URLSearchParams({
    select,
    order: "created_at.desc",
    offset: String(offset),
    limit: String(safePageSize),
  });
  const response = await fetch(`${config.url}/rest/v1/contacts?${query.toString()}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      Prefer: "count=exact",
    },
  });

  if (!response.ok) throw new Error(await readError(response));

  const rows = (await response.json()) as SupabaseContactRow[];
  const contentRange = response.headers.get("content-range");
  const totalPart = contentRange?.split("/")[1];
  const parsedTotal = totalPart && totalPart !== "*" ? Number(totalPart) : Number.NaN;

  return {
    contacts: rows.map(mapContact),
    total: Number.isFinite(parsedTotal) ? parsedTotal : offset + rows.length,
  };
}
