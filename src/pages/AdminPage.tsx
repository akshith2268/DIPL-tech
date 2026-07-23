import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/system/Seo";
import { assets } from "../config/assets";
import {
  enrollAdminTotp,
  fetchAdminAnalytics,
  fetchAdminContacts,
  fetchContactCounts,
  getAdminAccess,
  setContactReadState,
  signInAdmin,
  signOutAdmin,
  verifyAdminTotp,
  type AdminAccess,
  type AdminContact,
  type AnalyticsDashboard,
  type AnalyticsRange,
  type ContactCounts,
  type ContactFilter,
  type RankedMetric,
  type TotpEnrollment,
  type TrendPoint,
} from "../services/supabase/admin";

const contactsPerPage = 10;
const emptyCounts: ContactCounts = { inbox: 0, unread: 0, read: 0 };
const rangeOptions: { key: AnalyticsRange; label: string }[] = [
  { key: "1h", label: "Last 1 hour" },
  { key: "6h", label: "Last 6 hours" },
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
];

type GateStage =
  | "loading"
  | "signed-out"
  | "enrol"
  | "challenge"
  | "ready"
  | "denied";

type RequestStatus = "idle" | "loading" | "error";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMetricDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(value: number | null) {
  if (value === null) return "Collecting";
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(1)} s`;
}

function messageExcerpt(value: string, maximumLength = 150) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maximumLength
    ? `${normalized.slice(0, maximumLength).trimEnd()}…`
    : normalized;
}

function displayMetricLabel(value: string, kind?: "country" | "device") {
  if (kind === "country" && /^[A-Z]{2}$/.test(value)) {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(value) || value;
    } catch {
      return value;
    }
  }
  if (kind === "device") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
}

function SummaryCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <article className="admin-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function TrendChart({
  points,
  series = "pageViews",
  secondary = false,
}: {
  points: TrendPoint[];
  series?: "pageViews" | "blogViews";
  secondary?: boolean;
}) {
  const coordinates = useMemo(() => {
    if (points.length === 0) return "";
    const values = points.map((point) => point[series]);
    const maximum = Math.max(1, ...values);
    const width = 720;
    const height = 190;
    return points.map((point, index) => {
      const x = points.length === 1
        ? width / 2
        : (index / (points.length - 1)) * width;
      const y = height - (point[series] / maximum) * (height - 22) - 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [points, series]);

  if (points.length === 0) {
    return (
      <div className="admin-chart admin-chart--empty">
        <p>Traffic will appear here after the first production visits.</p>
      </div>
    );
  }

  return (
    <div className="admin-chart">
      <svg
        aria-label={`${series === "blogViews" ? "Blog" : "Website"} visit trend`}
        role="img"
        viewBox="0 0 720 210"
      >
        <line x1="0" x2="720" y1="200" y2="200" />
        <line x1="0" x2="720" y1="105" y2="105" />
        <polyline
          className={secondary ? "admin-chart__line--secondary" : ""}
          points={coordinates}
        />
      </svg>
      <div className="admin-chart__range">
        <span>{formatMetricDate(points[0]?.bucket || "")}</span>
        <span>{formatMetricDate(points.at(-1)?.bucket || "")}</span>
      </div>
    </div>
  );
}

function RankedList({
  items,
  emptyText,
  kind,
}: {
  items: RankedMetric[];
  emptyText: string;
  kind?: "country" | "device";
}) {
  if (items.length === 0) {
    return <p className="admin-ranked-empty">{emptyText}</p>;
  }

  const maximum = Math.max(...items.map((item) => item.value), 1);
  return (
    <ol className="admin-ranked-list">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          <span className="admin-ranked-list__index">{index + 1}</span>
          <span className="admin-ranked-list__label">
            {displayMetricLabel(item.label, kind)}
            <span
              aria-hidden="true"
              style={{ "--admin-bar": `${(item.value / maximum) * 100}%` } as CSSProperties}
            />
          </span>
          <strong>{item.value}</strong>
        </li>
      ))}
    </ol>
  );
}

function AccessCard({
  children,
  eyebrow,
  title,
  body,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="admin-access-grid">
      <div className="admin-login-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
      <div className="admin-access-card glass-panel">{children}</div>
    </div>
  );
}

export default function AdminPage() {
  const [gateStage, setGateStage] = useState<GateStage>("loading");
  const [adminAccess, setAdminAccess] = useState<AdminAccess | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [authStatus, setAuthStatus] = useState<RequestStatus>("loading");
  const [authMessage, setAuthMessage] = useState("");

  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [analyticsStatus, setAnalyticsStatus] =
    useState<RequestStatus>("idle");
  const [analyticsMessage, setAnalyticsMessage] = useState("");

  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [contactCounts, setContactCounts] =
    useState<ContactCounts>(emptyCounts);
  const [contactFilter, setContactFilter] =
    useState<ContactFilter>("inbox");
  const [selectedContact, setSelectedContact] =
    useState<AdminContact | null>(null);
  const [contactPage, setContactPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [contactsStatus, setContactsStatus] =
    useState<RequestStatus>("idle");
  const [contactsMessage, setContactsMessage] = useState("");
  const [contactActionPending, setContactActionPending] = useState(false);

  const totalContactPages = Math.max(
    1,
    Math.ceil(totalContacts / contactsPerPage),
  );

  const beginEnrollment = useCallback(async () => {
    setAuthStatus("loading");
    setAuthMessage("");
    try {
      const nextEnrollment = await enrollAdminTotp();
      setEnrollment(nextEnrollment);
      setGateStage("enrol");
      setAuthStatus("idle");
    } catch (error) {
      setAuthStatus("error");
      setAuthMessage(
        error instanceof Error
          ? error.message
          : "Authenticator enrolment could not be started.",
      );
    }
  }, []);

  const applyAccess = useCallback(async (access: AdminAccess) => {
    setAdminAccess(access);

    if (!access.authenticated) {
      setGateStage("signed-out");
      setAuthStatus("idle");
      return;
    }

    if (!access.isAdmin) {
      await signOutAdmin().catch(() => undefined);
      setGateStage("denied");
      setAuthStatus("error");
      setAuthMessage("Access denied. This account is not an approved administrator.");
      return;
    }

    if (access.currentLevel === "aal2") {
      setGateStage("ready");
      setAuthStatus("idle");
      setAuthMessage("");
      return;
    }

    if (access.verifiedTotpFactorId) {
      setGateStage("challenge");
      setAuthStatus("idle");
      return;
    }

    await beginEnrollment();
  }, [beginEnrollment]);

  useEffect(() => {
    let active = true;

    void (async () => {
      setAuthStatus("loading");
      try {
        const access = await getAdminAccess();
        if (active) await applyAccess(access);
      } catch (error) {
        if (!active) return;
        setGateStage("signed-out");
        setAuthStatus("error");
        setAuthMessage(
          error instanceof Error
            ? error.message
            : "The administrator session could not be checked.",
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [applyAccess]);

  const loadAnalytics = useCallback(async () => {
    if (gateStage !== "ready") return;
    setAnalyticsStatus("loading");
    setAnalyticsMessage("");
    try {
      setAnalytics(await fetchAdminAnalytics(range));
      setAnalyticsStatus("idle");
    } catch (error) {
      setAnalyticsStatus("error");
      setAnalyticsMessage(
        error instanceof Error
          ? error.message
          : "Website analytics could not be loaded.",
      );
    }
  }, [gateStage, range]);

  const loadContacts = useCallback(async () => {
    if (gateStage !== "ready") return;
    setContactsStatus("loading");
    setContactsMessage("");
    try {
      const [pageResult, counts] = await Promise.all([
        fetchAdminContacts(contactPage, contactsPerPage, contactFilter),
        fetchContactCounts(),
      ]);
      const lastAvailablePage = Math.max(
        1,
        Math.ceil(pageResult.total / contactsPerPage),
      );
      if (contactPage > lastAvailablePage) {
        setContactPage(lastAvailablePage);
        return;
      }
      setContacts(pageResult.contacts);
      setTotalContacts(pageResult.total);
      setContactCounts(counts);
      setContactsStatus("idle");
    } catch (error) {
      setContactsStatus("error");
      setContactsMessage(
        error instanceof Error
          ? error.message
          : "Contact enquiries could not be loaded.",
      );
    }
  }, [contactFilter, contactPage, gateStage]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthStatus("loading");
    setAuthMessage("");
    try {
      const access = await signInAdmin(email, password);
      setPassword("");
      await applyAccess(access);
    } catch (error) {
      setAuthStatus("error");
      setAuthMessage(
        error instanceof Error ? error.message : "Admin login failed.",
      );
    }
  }

  async function handleMfaVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const factorId =
      enrollment?.factorId || adminAccess?.verifiedTotpFactorId || "";
    if (!factorId) {
      setAuthStatus("error");
      setAuthMessage("No authenticator factor is available.");
      return;
    }

    setAuthStatus("loading");
    setAuthMessage("");
    try {
      const access = await verifyAdminTotp(factorId, mfaCode);
      setMfaCode("");
      setEnrollment(null);
      await applyAccess(access);
    } catch (error) {
      setAuthStatus("error");
      setAuthMessage(
        error instanceof Error
          ? error.message
          : "The authenticator code was not accepted.",
      );
    }
  }

  async function logout() {
    setAuthStatus("loading");
    await signOutAdmin().catch(() => undefined);
    setGateStage("signed-out");
    setAdminAccess(null);
    setEnrollment(null);
    setMfaCode("");
    setAnalytics(null);
    setContacts([]);
    setSelectedContact(null);
    setAuthStatus("idle");
    setAuthMessage("");
  }

  async function openContact(contact: AdminContact) {
    setSelectedContact(contact);
    setContactsMessage("");
    if (contact.readAt) return;

    setContactActionPending(true);
    try {
      const updated = await setContactReadState(contact.id, true);
      setSelectedContact(updated);
      setContacts((current) =>
        current.map((item) => item.id === updated.id ? updated : item)
      );
      setContactCounts((current) => ({
        ...current,
        unread: Math.max(0, current.unread - 1),
        read: current.read + 1,
      }));
    } catch (error) {
      setContactsMessage(
        error instanceof Error
          ? error.message
          : "This enquiry could not be marked read.",
      );
    } finally {
      setContactActionPending(false);
    }
  }

  async function toggleSelectedReadState() {
    if (!selectedContact) return;
    setContactActionPending(true);
    setContactsMessage("");
    try {
      const updated = await setContactReadState(
        selectedContact.id,
        !selectedContact.readAt,
      );
      setSelectedContact(updated);
      setContacts((current) =>
        current.map((item) => item.id === updated.id ? updated : item)
      );
      await loadContacts();
    } catch (error) {
      setContactsMessage(
        error instanceof Error
          ? error.message
          : "The enquiry read state could not be changed.",
      );
    } finally {
      setContactActionPending(false);
    }
  }

  function changeContactFilter(nextFilter: ContactFilter) {
    setContactFilter(nextFilter);
    setContactPage(1);
  }

  function returnToDashboard() {
    setSelectedContact(null);
    void loadContacts();
    window.requestAnimationFrame(() => {
      document.getElementById("admin-enquiries")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  const blogTrafficShare =
    analytics && analytics.summary.pageViews > 0
      ? Math.round(
        (analytics.summary.blogViews / analytics.summary.pageViews) * 100,
      )
      : 0;

  return (
    <>
      <Seo
        title="Admin"
        description="Private Drith Infra operations dashboard."
        path="/admin"
        robots="noindex, nofollow, noarchive"
      />

      <main className="admin-page">
        <section className="admin-shell">
          <div className="admin-topbar glass-panel">
            <Link className="brand" to="/" aria-label="Drith Infra home">
              <img
                src={assets.brand.logo}
                alt=""
                width="42"
                height="42"
                loading="eager"
                decoding="async"
              />
              <span>
                <strong>Drith Infra</strong>
                <small>Admin 2.0</small>
              </span>
            </Link>

            {gateStage === "ready" ? (
              <div className="admin-topbar__account">
                <span>
                  <strong>{adminAccess?.email}</strong>
                  <small>MFA verified</small>
                </span>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => void logout()}
                >
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link className="button button--secondary" to="/">
                <span>Back to site</span>
              </Link>
            )}
          </div>

          {gateStage === "loading" ? (
            <div className="admin-gate-loading" role="status">
              <span aria-hidden="true" />
              Checking secure access…
            </div>
          ) : null}

          {gateStage === "signed-out" ? (
            <AccessCard
              eyebrow="Private access"
              title="Selected administrators only."
              body="Sign in with an allowlisted Supabase account. An authenticator-app code is required before private data can be read."
            >
              <form className="admin-auth-form" onSubmit={handleLogin}>
                <label>
                  Admin email
                  <input
                    autoComplete="email"
                    autoFocus
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@drithinfra.in"
                    required
                    type="email"
                    value={email}
                  />
                </label>
                <label>
                  Password
                  <input
                    autoComplete="current-password"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    required
                    type="password"
                    value={password}
                  />
                </label>
                <button
                  className="button button--primary"
                  disabled={authStatus === "loading"}
                  type="submit"
                >
                  <span>
                    {authStatus === "loading" ? "Checking…" : "Continue securely"}
                  </span>
                </button>
                {authMessage ? (
                  <p className="admin-message admin-message--error" role="alert">
                    {authMessage}
                  </p>
                ) : null}
              </form>
            </AccessCard>
          ) : null}

          {gateStage === "denied" ? (
            <AccessCard
              eyebrow="Access denied"
              title="This account is not allowlisted."
              body="Authentication succeeded, but the account does not have Drith Infra administrator membership."
            >
              <p className="admin-security-note">
                Ask the Supabase project owner to add the account to
                <code> public.admin_users</code>.
              </p>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  setGateStage("signed-out");
                  setAuthMessage("");
                  setAuthStatus("idle");
                }}
              >
                <span>Use another account</span>
              </button>
            </AccessCard>
          ) : null}

          {gateStage === "enrol" && enrollment ? (
            <AccessCard
              eyebrow="First-time security"
              title="Connect an authenticator app."
              body="Scan this QR code in Google Authenticator, Microsoft Authenticator, Authy, or another TOTP app. Dashboard access remains locked until verification."
            >
              <div className="admin-mfa-enrolment">
                <img
                  src={enrollment.qrCode}
                  alt="QR code for Drith Infra administrator MFA"
                  width="220"
                  height="220"
                />
                <p>
                  Cannot scan? Enter this secret manually:
                  <code>{enrollment.secret}</code>
                </p>
              </div>
              <form className="admin-auth-form" onSubmit={handleMfaVerification}>
                <label>
                  Six-digit authenticator code
                  <input
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={8}
                    minLength={6}
                    onChange={(event) => setMfaCode(event.target.value)}
                    pattern="[0-9 ]{6,8}"
                    placeholder="000000"
                    required
                    value={mfaCode}
                  />
                </label>
                <button
                  className="button button--primary"
                  disabled={authStatus === "loading"}
                  type="submit"
                >
                  <span>
                    {authStatus === "loading" ? "Verifying…" : "Verify and unlock"}
                  </span>
                </button>
                {authMessage ? (
                  <p className="admin-message admin-message--error" role="alert">
                    {authMessage}
                  </p>
                ) : null}
              </form>
            </AccessCard>
          ) : null}

          {gateStage === "challenge" ? (
            <AccessCard
              eyebrow="Second factor"
              title="Enter your authenticator code."
              body="Your password was accepted. Complete MFA to unlock analytics and contact enquiries."
            >
              <form className="admin-auth-form" onSubmit={handleMfaVerification}>
                <label>
                  Six-digit authenticator code
                  <input
                    autoComplete="one-time-code"
                    autoFocus
                    inputMode="numeric"
                    maxLength={8}
                    minLength={6}
                    onChange={(event) => setMfaCode(event.target.value)}
                    pattern="[0-9 ]{6,8}"
                    placeholder="000000"
                    required
                    value={mfaCode}
                  />
                </label>
                <button
                  className="button button--primary"
                  disabled={authStatus === "loading"}
                  type="submit"
                >
                  <span>
                    {authStatus === "loading" ? "Verifying…" : "Unlock dashboard"}
                  </span>
                </button>
                {authMessage ? (
                  <p className="admin-message admin-message--error" role="alert">
                    {authMessage}
                  </p>
                ) : null}
              </form>
            </AccessCard>
          ) : null}

          {gateStage === "ready" && selectedContact ? (
            <article className="admin-contact-view">
              <button
                className="admin-contact-view__back"
                type="button"
                onClick={returnToDashboard}
              >
                <span aria-hidden="true">←</span> Back to dashboard
              </button>

              <header className="admin-contact-view__header">
                <div>
                  <p className="eyebrow">
                    {selectedContact.projectType || "General enquiry"}
                  </p>
                  <h1>{selectedContact.name}</h1>
                  <p>Submitted {formatDate(selectedContact.createdAt)}</p>
                </div>
                <div className="admin-contact-view__status-row">
                  <span className="admin-contact-view__status">
                    {selectedContact.status || "New"}
                  </span>
                  <span className="admin-contact-view__read">
                    {selectedContact.readAt ? "Read" : "Unread"}
                  </span>
                </div>
              </header>

              {contactsMessage ? (
                <p className="admin-message admin-message--error" role="alert">
                  {contactsMessage}
                </p>
              ) : null}

              <div className="admin-contact-view__layout">
                <section
                  className="admin-contact-view__message"
                  aria-labelledby="admin-message-heading"
                >
                  <p className="admin-contact-view__label">Message</p>
                  <h2 id="admin-message-heading">Enquiry details</h2>
                  <div className="admin-contact-view__message-body">
                    {selectedContact.message}
                  </div>

                  <div className="admin-contact-view__actions">
                    <a
                      className="button button--primary"
                      href={`mailto:${selectedContact.email}`}
                    >
                      <span>Reply by email</span>
                    </a>
                    <a
                      className="button button--secondary"
                      href={`tel:${selectedContact.phone}`}
                    >
                      <span>Call contact</span>
                    </a>
                    <button
                      className="button button--secondary"
                      disabled={contactActionPending}
                      type="button"
                      onClick={() => void toggleSelectedReadState()}
                    >
                      <span>
                        {selectedContact.readAt ? "Mark unread" : "Mark read"}
                      </span>
                    </button>
                  </div>
                </section>

                <aside
                  className="admin-contact-view__sidebar"
                  aria-label="Contact information"
                >
                  <h2>Contact information</h2>
                  <dl className="admin-contact-view__meta">
                    <div>
                      <dt>Email</dt>
                      <dd>
                        <a href={`mailto:${selectedContact.email}`}>
                          {selectedContact.email}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>
                        <a href={`tel:${selectedContact.phone}`}>
                          {selectedContact.phone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Preferred follow-up</dt>
                      <dd>{selectedContact.preferredFollowUp}</dd>
                    </div>
                    {selectedContact.organization ? (
                      <div>
                        <dt>Organization</dt>
                        <dd>{selectedContact.organization}</dd>
                      </div>
                    ) : null}
                    {selectedContact.role ? (
                      <div><dt>Role</dt><dd>{selectedContact.role}</dd></div>
                    ) : null}
                    {selectedContact.region ? (
                      <div><dt>Region</dt><dd>{selectedContact.region}</dd></div>
                    ) : null}
                    <div>
                      <dt>Evaluation</dt>
                      <dd>
                        {selectedContact.requestEvaluation
                          ? "Requested"
                          : "Not requested"}
                      </dd>
                    </div>
                    <div>
                      <dt>Updates</dt>
                      <dd>
                        {selectedContact.subscribe
                          ? "Subscribed"
                          : "Not subscribed"}
                      </dd>
                    </div>
                  </dl>
                </aside>
              </div>
            </article>
          ) : null}

          {gateStage === "ready" && !selectedContact ? (
            <div className="admin-dashboard">
              <header className="admin-dashboard__hero">
                <div>
                  <p className="eyebrow">Secure operations</p>
                  <h1>Admin dashboard</h1>
                  <p>
                    Website activity, Blog visits, and contact enquiries in one
                    private workspace.
                  </p>
                </div>
                <nav className="admin-dashboard__anchors" aria-label="Dashboard sections">
                  <a href="#admin-traffic">Traffic</a>
                  <a href="#admin-blog">Blog</a>
                  <a href="#admin-enquiries">Enquiries</a>
                </nav>
              </header>

              <section
                className="admin-dashboard-section glass-panel"
                id="admin-traffic"
                aria-labelledby="admin-traffic-title"
              >
                <header className="admin-dashboard-section__header">
                  <div>
                    <p className="eyebrow">Website traffic</p>
                    <h2 id="admin-traffic-title">Audience and performance</h2>
                    <p>
                      First-party production traffic from drithinfra.in. Admin
                      and localhost activity is excluded.
                    </p>
                  </div>
                  <button
                    className="admin-refresh"
                    disabled={analyticsStatus === "loading"}
                    type="button"
                    onClick={() => void loadAnalytics()}
                  >
                    {analyticsStatus === "loading" ? "Refreshing…" : "Refresh"}
                  </button>
                </header>

                <div className="admin-range-filter" aria-label="Analytics date range">
                  {rangeOptions.map((option) => (
                    <button
                      aria-pressed={range === option.key}
                      className={range === option.key ? "is-active" : ""}
                      key={option.key}
                      type="button"
                      onClick={() => setRange(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {analyticsMessage ? (
                  <p className="admin-message admin-message--error" role="alert">
                    {analyticsMessage}
                  </p>
                ) : null}

                <div
                  className={`admin-summary-grid ${
                    analyticsStatus === "loading" ? "is-loading" : ""
                  }`}
                >
                  <SummaryCard
                    label="Page views"
                    value={analytics?.summary.pageViews || 0}
                    note="Public route loads"
                  />
                  <SummaryCard
                    label="Sessions"
                    value={analytics?.summary.sessions || 0}
                    note="Unique browser sessions"
                  />
                  <SummaryCard
                    label="Blog visits"
                    value={analytics?.summary.blogViews || 0}
                    note="Visits to /blogs"
                  />
                  <SummaryCard
                    label="Median load"
                    value={formatDuration(analytics?.summary.medianLoadMs ?? null)}
                    note="Real-user navigation"
                  />
                  <SummaryCard
                    label="p75 LCP"
                    value={formatDuration(analytics?.summary.p75LcpMs ?? null)}
                    note="75th percentile"
                  />
                </div>

                <div className="admin-analytics-layout">
                  <article className="admin-data-panel admin-data-panel--chart">
                    <header>
                      <div>
                        <span>Traffic trend</span>
                        <strong>Page views over time</strong>
                      </div>
                      <small>{rangeOptions.find((item) => item.key === range)?.label}</small>
                    </header>
                    <TrendChart points={analytics?.trend || []} />
                  </article>

                  <article className="admin-data-panel">
                    <header>
                      <div>
                        <span>Top list</span>
                        <strong>Pages</strong>
                      </div>
                    </header>
                    <RankedList
                      items={analytics?.topPages || []}
                      emptyText="No production page visits yet."
                    />
                  </article>
                </div>

                <div className="admin-toplists-grid">
                  <article className="admin-data-panel">
                    <header><strong>Countries</strong></header>
                    <RankedList
                      items={analytics?.topCountries || []}
                      emptyText="Country data is not available yet."
                      kind="country"
                    />
                  </article>
                  <article className="admin-data-panel">
                    <header><strong>Devices</strong></header>
                    <RankedList
                      items={analytics?.topDevices || []}
                      emptyText="Device data is not available yet."
                      kind="device"
                    />
                  </article>
                  <article className="admin-data-panel">
                    <header><strong>Referrers</strong></header>
                    <RankedList
                      items={analytics?.topReferrers || []}
                      emptyText="Referral data is not available yet."
                    />
                  </article>
                </div>
              </section>

              <section
                className="admin-dashboard-section glass-panel"
                id="admin-blog"
                aria-labelledby="admin-blog-title"
              >
                <header className="admin-dashboard-section__header">
                  <div>
                    <p className="eyebrow">Blog dashboard</p>
                    <h2 id="admin-blog-title">Blog page visits</h2>
                    <p>
                      Measures visits to the Blog page only. It does not claim
                      individual article completion.
                    </p>
                  </div>
                  <Link className="admin-section-link" to="/blogs">
                    View Blog <span aria-hidden="true">→</span>
                  </Link>
                </header>

                <div className="admin-blog-layout">
                  <div className="admin-summary-grid admin-summary-grid--blog">
                    <SummaryCard
                      label="Blog visits"
                      value={analytics?.summary.blogViews || 0}
                      note={rangeOptions.find((item) => item.key === range)?.label || ""}
                    />
                    <SummaryCard
                      label="Blog sessions"
                      value={analytics?.summary.blogSessions || 0}
                      note="Unique sessions on /blogs"
                    />
                    <SummaryCard
                      label="Traffic share"
                      value={`${blogTrafficShare}%`}
                      note="Share of all page views"
                    />
                  </div>
                  <article className="admin-data-panel admin-data-panel--chart">
                    <header>
                      <div>
                        <span>Blog trend</span>
                        <strong>Visits to /blogs</strong>
                      </div>
                    </header>
                    <TrendChart
                      points={analytics?.trend || []}
                      series="blogViews"
                      secondary
                    />
                  </article>
                  <article className="admin-data-panel">
                    <header><strong>Blog referral sources</strong></header>
                    <RankedList
                      items={analytics?.blogReferrers || []}
                      emptyText="No Blog referral data yet."
                    />
                  </article>
                </div>
              </section>

              <section
                className="admin-dashboard-section glass-panel"
                id="admin-enquiries"
                aria-labelledby="admin-enquiries-title"
              >
                <header className="admin-dashboard-section__header">
                  <div>
                    <p className="eyebrow">Contact enquiries</p>
                    <h2 id="admin-enquiries-title">Inbox</h2>
                    <p>
                      {totalContacts === 1
                        ? "1 enquiry in this view."
                        : `${totalContacts} enquiries in this view.`}
                    </p>
                  </div>
                  <button
                    className="admin-refresh"
                    disabled={contactsStatus === "loading"}
                    type="button"
                    onClick={() => void loadContacts()}
                  >
                    {contactsStatus === "loading" ? "Refreshing…" : "Refresh"}
                  </button>
                </header>

                <div className="admin-inbox-filters" aria-label="Enquiry filters">
                  {(["inbox", "unread", "read"] as ContactFilter[]).map((filter) => (
                    <button
                      aria-pressed={contactFilter === filter}
                      className={contactFilter === filter ? "is-active" : ""}
                      key={filter}
                      type="button"
                      onClick={() => changeContactFilter(filter)}
                    >
                      <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                      <strong>{contactCounts[filter]}</strong>
                    </button>
                  ))}
                </div>

                {contactsMessage ? (
                  <p className="admin-message admin-message--error" role="alert">
                    {contactsMessage}
                  </p>
                ) : null}

                {contacts.length === 0 && contactsStatus !== "loading" ? (
                  <div className="admin-empty">
                    <h3>No {contactFilter} enquiries.</h3>
                    <p>Matching contact submissions will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div className="admin-contact-list__heading" aria-hidden="true">
                      <span>Contact</span>
                      <span>Project</span>
                      <span>Message</span>
                      <span>Received</span>
                    </div>
                    <ul className="admin-contact-list" aria-label="Contact enquiries">
                      {contacts.map((contact) => (
                        <li key={contact.id}>
                          <button
                            className={`admin-contact-row ${
                              contact.readAt ? "" : "admin-contact-row--unread"
                            }`}
                            type="button"
                            aria-label={`Open message from ${contact.name}`}
                            onClick={() => void openContact(contact)}
                          >
                            <span
                              className="admin-contact-row__read-dot"
                              aria-label={contact.readAt ? "Read" : "Unread"}
                            />
                            <span className="admin-contact-row__person">
                              <strong>{contact.name}</strong>
                              <small>{contact.email}</small>
                            </span>
                            <span className="admin-contact-row__project">
                              {contact.projectType || "General enquiry"}
                            </span>
                            <span className="admin-contact-row__preview">
                              {messageExcerpt(contact.message)}
                            </span>
                            <span className="admin-contact-row__date">
                              {formatDate(contact.createdAt)}
                              <small>{contact.status || "New"}</small>
                            </span>
                            <span className="admin-contact-row__arrow" aria-hidden="true">
                              →
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {totalContactPages > 1 ? (
                      <nav className="admin-pagination" aria-label="Contact inbox pages">
                        <button
                          className="admin-pagination__button"
                          type="button"
                          disabled={
                            contactPage === 1 || contactsStatus === "loading"
                          }
                          onClick={() =>
                            setContactPage((current) => Math.max(1, current - 1))
                          }
                        >
                          Previous
                        </button>
                        <span>
                          Page <strong>{contactPage}</strong> of {totalContactPages}
                        </span>
                        <button
                          className="admin-pagination__button"
                          type="button"
                          disabled={
                            contactPage === totalContactPages ||
                            contactsStatus === "loading"
                          }
                          onClick={() =>
                            setContactPage((current) =>
                              Math.min(totalContactPages, current + 1)
                            )
                          }
                        >
                          Next
                        </button>
                      </nav>
                    ) : null}
                  </>
                )}
              </section>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
