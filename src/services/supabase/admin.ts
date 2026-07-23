import { getSupabaseClient } from "./client";

export type ContactFilter = "inbox" | "unread" | "read";
export type AnalyticsRange = "1h" | "6h" | "24h" | "7d";

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
  readAt: string | null;
  readBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAccess = {
  authenticated: boolean;
  email: string;
  isAdmin: boolean;
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  verifiedTotpFactorId: string | null;
};

export type TotpEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
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
  read_at: string | null;
  read_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminContactsPage = {
  contacts: AdminContact[];
  total: number;
};

export type ContactCounts = {
  inbox: number;
  unread: number;
  read: number;
};

export type RankedMetric = {
  label: string;
  value: number;
};

export type TrendPoint = {
  bucket: string;
  pageViews: number;
  blogViews: number;
};

export type AnalyticsDashboard = {
  rangeKey: AnalyticsRange;
  generatedAt: string;
  summary: {
    pageViews: number;
    sessions: number;
    blogViews: number;
    blogSessions: number;
    medianLoadMs: number | null;
    p75LcpMs: number | null;
  };
  trend: TrendPoint[];
  topPages: RankedMetric[];
  topCountries: RankedMetric[];
  topDevices: RankedMetric[];
  topReferrers: RankedMetric[];
  blogReferrers: RankedMetric[];
};

const contactSelect = [
  "id", "name", "email", "phone", "organization", "role", "project_type",
  "region", "message", "preferred_follow_up", "request_evaluation",
  "subscribe", "status", "source_url", "read_at", "read_by", "created_at",
  "updated_at",
].join(",");

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
    readAt: row.read_at,
    readBy: row.read_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function asNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asNullableNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const number = asNumber(value, Number.NaN);
  return Number.isFinite(number) ? number : null;
}

function normalizeAssuranceLevel(value: unknown): "aal1" | "aal2" | null {
  return value === "aal1" || value === "aal2" ? value : null;
}

function rankedMetrics(value: unknown): RankedMetric[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label : "";
    return label ? [{ label, value: asNumber(row.value) }] : [];
  });
}

export function normalizeAnalyticsDashboard(
  value: unknown,
  fallbackRange: AnalyticsRange,
): AnalyticsDashboard {
  const root =
    value && typeof value === "object"
      ? value as Record<string, unknown>
      : {};
  const summary =
    root.summary && typeof root.summary === "object"
      ? root.summary as Record<string, unknown>
      : {};
  const validRanges: AnalyticsRange[] = ["1h", "6h", "24h", "7d"];
  const rangeKey = validRanges.includes(root.rangeKey as AnalyticsRange)
    ? root.rangeKey as AnalyticsRange
    : fallbackRange;

  const trend = Array.isArray(root.trend)
    ? root.trend.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      if (typeof row.bucket !== "string") return [];
      return [{
        bucket: row.bucket,
        pageViews: asNumber(row.pageViews),
        blogViews: asNumber(row.blogViews),
      }];
    })
    : [];

  return {
    rangeKey,
    generatedAt:
      typeof root.generatedAt === "string"
        ? root.generatedAt
        : new Date().toISOString(),
    summary: {
      pageViews: asNumber(summary.pageViews),
      sessions: asNumber(summary.sessions),
      blogViews: asNumber(summary.blogViews),
      blogSessions: asNumber(summary.blogSessions),
      medianLoadMs: asNullableNumber(summary.medianLoadMs),
      p75LcpMs: asNullableNumber(summary.p75LcpMs),
    },
    trend,
    topPages: rankedMetrics(root.topPages),
    topCountries: rankedMetrics(root.topCountries),
    topDevices: rankedMetrics(root.topDevices),
    topReferrers: rankedMetrics(root.topReferrers),
    blogReferrers: rankedMetrics(root.blogReferrers),
  };
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = getSupabaseClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const session = sessionData.session;
  if (!session?.user) {
    return {
      authenticated: false,
      email: "",
      isAdmin: false,
      currentLevel: null,
      nextLevel: null,
      verifiedTotpFactorId: null,
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (membershipError) throw membershipError;

  if (!membership) {
    return {
      authenticated: true,
      email: session.user.email || "",
      isAdmin: false,
      currentLevel: null,
      nextLevel: null,
      verifiedTotpFactorId: null,
    };
  }

  const [assurance, factorList] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);
  if (assurance.error) throw assurance.error;
  if (factorList.error) throw factorList.error;

  const verifiedFactor = factorList.data.totp.find(
    (factor) => factor.status === "verified",
  );

  return {
    authenticated: true,
    email: session.user.email || "",
    isAdmin: true,
    currentLevel: normalizeAssuranceLevel(assurance.data.currentLevel),
    nextLevel: normalizeAssuranceLevel(assurance.data.nextLevel),
    verifiedTotpFactorId: verifiedFactor?.id || null,
  };
}

export async function signInAdmin(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return getAdminAccess();
}

export async function signOutAdmin() {
  const { error } = await getSupabaseClient().auth.signOut({ scope: "local" });
  if (error) throw error;
}

export async function enrollAdminTotp(): Promise<TotpEnrollment> {
  const { data, error } = await getSupabaseClient().auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Drith Infra Admin",
  });
  if (error) throw error;

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  };
}

export async function verifyAdminTotp(factorId: string, code: string) {
  const { error } =
    await getSupabaseClient().auth.mfa.challengeAndVerify({
      factorId,
      code: code.replace(/\s+/g, ""),
    });
  if (error) throw error;
  return getAdminAccess();
}

export async function fetchAdminAnalytics(
  range: AnalyticsRange,
): Promise<AnalyticsDashboard> {
  const { data, error } = await getSupabaseClient().rpc(
    "admin_analytics_dashboard",
    { range_key: range },
  );
  if (error) throw error;
  return normalizeAnalyticsDashboard(data, range);
}

export async function fetchAdminContacts(
  page = 1,
  pageSize = 10,
  filter: ContactFilter = "inbox",
): Promise<AdminContactsPage> {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = getSupabaseClient()
    .from("contacts")
    .select(contactSelect, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter === "unread") query = query.is("read_at", null);
  if (filter === "read") query = query.not("read_at", "is", null);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    contacts: ((data || []) as unknown as SupabaseContactRow[]).map(mapContact),
    total: count || 0,
  };
}

async function contactCount(filter: ContactFilter) {
  let query = getSupabaseClient()
    .from("contacts")
    .select("id", { count: "exact", head: true });

  if (filter === "unread") query = query.is("read_at", null);
  if (filter === "read") query = query.not("read_at", "is", null);

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export async function fetchContactCounts(): Promise<ContactCounts> {
  const [inbox, unread, read] = await Promise.all([
    contactCount("inbox"),
    contactCount("unread"),
    contactCount("read"),
  ]);
  return { inbox, unread, read };
}

export async function setContactReadState(
  contactId: string,
  read: boolean,
): Promise<AdminContact> {
  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw userError || new Error("Administrator session is unavailable.");
  }

  const { data, error } = await supabase
    .from("contacts")
    .update({
      read_at: read ? new Date().toISOString() : null,
      read_by: read ? userData.user.id : null,
    })
    .eq("id", contactId)
    .select(contactSelect)
    .single();
  if (error) throw error;

  return mapContact(data as unknown as SupabaseContactRow);
}
