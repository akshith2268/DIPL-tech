import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/system/Seo";
import { assets } from "../config/assets";
import {
  fetchAdminContacts,
  signInAdmin,
  signOutAdmin,
  type AdminContact,
  type AdminSession,
} from "../services/supabase/admin";

const sessionStorageKey = "drith-supabase-admin-session";
const contactsPerPage = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function messageExcerpt(value: string, maximumLength = 150) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maximumLength
    ? `${normalized.slice(0, maximumLength).trimEnd()}…`
    : normalized;
}

function readStoredSession() {
  try {
    const stored = sessionStorage.getItem(sessionStorageKey);
    if (!stored) return null;

    const session = JSON.parse(stored) as AdminSession;
    if (!session.accessToken || session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(sessionStorageKey);
      return null;
    }

    return session;
  } catch {
    sessionStorage.removeItem(sessionStorageKey);
    return null;
  }
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession());
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<AdminContact | null>(null);
  const [page, setPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalContacts / contactsPerPage));

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const nextSession = await signInAdmin(email, password);
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
      setPage(1);
      setSelectedContact(null);
      setSession(nextSession);
      setPassword("");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Admin login failed.");
    }
  }

  async function loadContacts(activeSession = session, requestedPage = page) {
    if (!activeSession) return;
    setStatus("loading");
    setMessage("");

    try {
      const result = await fetchAdminContacts(activeSession.accessToken, requestedPage, contactsPerPage);
      const lastAvailablePage = Math.max(1, Math.ceil(result.total / contactsPerPage));

      if (requestedPage > lastAvailablePage) {
        setPage(lastAvailablePage);
        return;
      }

      setContacts(result.contacts);
      setTotalContacts(result.total);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not load contact submissions.");
    }
  }

  function logout() {
    if (session) void signOutAdmin(session);
    sessionStorage.removeItem(sessionStorageKey);
    setSession(null);
    setContacts([]);
    setSelectedContact(null);
    setPage(1);
    setTotalContacts(0);
    setEmail("");
    setPassword("");
    setStatus("idle");
    setMessage("");
  }

  useEffect(() => {
    if (session) void loadContacts(session, page);
  }, [session, page]);

  return (
    <>
      <Seo
        title="Admin"
        description="Private Drith Infra admin inbox for contact submissions."
        path="/admin"
      />

      <main className="admin-page">
        <section className="admin-shell">
          <div className="admin-topbar glass-panel">
            <Link className="brand" to="/">
              <img src={assets.brand.logo} alt="" width="42" height="42" loading="lazy" decoding="async" />
              <span>
                <strong>Drith Infra</strong>
                <small>Admin</small>
              </span>
            </Link>
            {session ? (
              <button className="button button--secondary" type="button" onClick={logout}>
                <span>Logout</span>
              </button>
            ) : (
              <Link className="button button--secondary" to="/">
                <span>Back to site</span>
              </Link>
            )}
          </div>

          {!session ? (
            <div className="admin-login-grid">
              <div className="admin-login-copy">
                <p className="eyebrow">Private access</p>
                <h1>Admin inbox for contact enquiries.</h1>
                <p>Sign in with your Supabase admin account to view contact form submissions stored in Supabase.</p>
              </div>

              <form className="admin-login-card glass-panel" onSubmit={handleLogin}>
                <label>
                  Admin email
                  <input
                    autoComplete="email"
                    autoFocus
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
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
                <button className="button button--primary" disabled={status === "loading"} type="submit">
                  <span>{status === "loading" ? "Checking..." : "Unlock admin"}</span>
                </button>
                {message ? <p className="admin-message admin-message--error">{message}</p> : null}
              </form>
            </div>
          ) : selectedContact ? (
            <article className="admin-contact-view">
              <button className="admin-contact-view__back" type="button" onClick={() => setSelectedContact(null)}>
                <span aria-hidden="true">←</span> Back to enquiries
              </button>

              <header className="admin-contact-view__header">
                <div>
                  <p className="eyebrow">{selectedContact.projectType || "General enquiry"}</p>
                  <h1>{selectedContact.name}</h1>
                  <p>Submitted {formatDate(selectedContact.createdAt)}</p>
                </div>
                <span className="admin-contact-view__status">{selectedContact.status || "New"}</span>
              </header>

              <div className="admin-contact-view__layout">
                <section className="admin-contact-view__message" aria-labelledby="admin-message-heading">
                  <p className="admin-contact-view__label">Message</p>
                  <h2 id="admin-message-heading">Enquiry details</h2>
                  <div className="admin-contact-view__message-body">{selectedContact.message}</div>

                  <div className="admin-contact-view__actions">
                    <a className="button button--primary" href={`mailto:${selectedContact.email}`}>
                      <span>Reply by email</span>
                    </a>
                    <a className="button button--secondary" href={`tel:${selectedContact.phone}`}>
                      <span>Call contact</span>
                    </a>
                  </div>
                </section>

                <aside className="admin-contact-view__sidebar" aria-label="Contact information">
                  <h2>Contact information</h2>
                  <dl className="admin-contact-view__meta">
                    <div>
                      <dt>Email</dt>
                      <dd><a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a></dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd><a href={`tel:${selectedContact.phone}`}>{selectedContact.phone}</a></dd>
                    </div>
                    <div>
                      <dt>Preferred follow-up</dt>
                      <dd>{selectedContact.preferredFollowUp}</dd>
                    </div>
                    {selectedContact.organization ? (
                      <div><dt>Organization</dt><dd>{selectedContact.organization}</dd></div>
                    ) : null}
                    {selectedContact.role ? (
                      <div><dt>Role</dt><dd>{selectedContact.role}</dd></div>
                    ) : null}
                    {selectedContact.region ? (
                      <div><dt>Region</dt><dd>{selectedContact.region}</dd></div>
                    ) : null}
                    <div>
                      <dt>Evaluation</dt>
                      <dd>{selectedContact.requestEvaluation ? "Requested" : "Not requested"}</dd>
                    </div>
                    <div>
                      <dt>Updates</dt>
                      <dd>{selectedContact.subscribe ? "Subscribed" : "Not subscribed"}</dd>
                    </div>
                  </dl>
                </aside>
              </div>
            </article>
          ) : (
            <div className="admin-inbox">
              <header className="admin-inbox__header">
                <div>
                  <p className="eyebrow">Contact inbox</p>
                  <h1>Latest enquiries</h1>
                  <p>
                    {totalContacts === 1 ? "1 enquiry" : `${totalContacts} enquiries`} in Supabase.
                    {contacts.length > 0
                      ? ` Showing ${(page - 1) * contactsPerPage + 1}-${(page - 1) * contactsPerPage + contacts.length}.`
                      : ""}
                  </p>
                </div>
                <button className="button button--primary" disabled={status === "loading"} type="button" onClick={() => void loadContacts()}>
                  <span>{status === "loading" ? "Refreshing..." : "Refresh"}</span>
                </button>
              </header>

              {message ? <p className="admin-message admin-message--error">{message}</p> : null}

              {contacts.length === 0 && status !== "loading" ? (
                <div className="admin-empty glass-panel">
                  <h2>No contacts yet.</h2>
                  <p>New contact form submissions will appear here once users submit the form.</p>
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
                          className="admin-contact-row"
                          type="button"
                          aria-label={`Open message from ${contact.name}`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <span className="admin-contact-row__person">
                            <strong>{contact.name}</strong>
                            <small>{contact.email}</small>
                          </span>
                          <span className="admin-contact-row__project">{contact.projectType || "General enquiry"}</span>
                          <span className="admin-contact-row__preview">{messageExcerpt(contact.message)}</span>
                          <span className="admin-contact-row__date">
                            {formatDate(contact.createdAt)}
                            <small>{contact.status || "New"}</small>
                          </span>
                          <span className="admin-contact-row__arrow" aria-hidden="true">→</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  {totalPages > 1 ? (
                    <nav className="admin-pagination" aria-label="Contact inbox pages">
                      <button
                        className="admin-pagination__button"
                        type="button"
                        disabled={page === 1 || status === "loading"}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                      >
                        Previous
                      </button>
                      <span>Page <strong>{page}</strong> of {totalPages}</span>
                      <button
                        className="admin-pagination__button"
                        type="button"
                        disabled={page === totalPages || status === "loading"}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      >
                        Next
                      </button>
                    </nav>
                  ) : null}
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
