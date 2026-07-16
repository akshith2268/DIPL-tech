import { useState, type FormEvent } from "react";
import { Partners } from "../components/sections/Partners";
import { Seo } from "../components/system/Seo";
import { Icon } from "../components/ui/Icon";
import { insertContactSubmission } from "../services/supabase/contact";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Reads browser form fields, validates consent, then inserts a row into Supabase.
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const consent = data.get("consent") === "on";
    if (!consent) {
      setStatus("error");
      setMessage("Please confirm that we may contact you.");
      return;
    }

    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      organization: "",
      role: "",
      projectType: String(data.get("projectType") || "General inquiry"),
      region: "",
      message: String(data.get("message") || ""),
      preferredFollowUp: "Email",
      requestEvaluation: false,
      subscribe: false,
      consent,
    };

    try {
      setStatus("submitting");
      setMessage("");
      const result = await insertContactSubmission(payload);
      setStatus("success");
      setMessage(
        result.emailSent
          ? "Thank you. Your enquiry has been recorded and a confirmation email is on its way."
          : "Thank you. Your enquiry has been recorded. Email confirmation may be delayed, but the team has your message.",
      );
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error && error.message.includes("configuration")
          ? "Supabase is not configured yet. Please add the frontend Supabase URL and anon key."
          : "We could not send the form. Please try again, or email drithinfra.pvt@gmail.com directly.",
      );
    }
  }

  return (
    <>
      <Seo
        title="Contact"
        description="Start a coastal infrastructure, research, government, investor, or collaboration conversation with Drith Infra."
        path="/contact"
      />

      <section className="contact-page shell">
        <div className="contact-page__intro">
          <p className="eyebrow">Start with context</p>
          <h1>Tell us about the coastline, risk, or collaboration.</h1>
          <p>Share enough for the team to route your enquiry. No technical brief is required at this stage.</p>

          <div className="contact-detail">
            <Icon name="mail" width="20" />
            <span><small>Email</small><a href="mailto:drithinfra.pvt@gmail.com">drithinfra.pvt@gmail.com</a></span>
          </div>
          <div className="contact-detail">
            <Icon name="map" width="20" />
            <span><small>Office</small>Pimpri-Chinchwad, Pune, India</span>
          </div>
          <div className="contact-detail">
            <Icon name="wave" width="20" />
            <span><small>Focus</small>Coastal resilience · Nature-based infrastructure</span>
          </div>
        </div>

        {/* Field names here are read by handleSubmit. If a name changes, update the payload mapping above. */}
        <form className="contact-form glass-panel" onSubmit={handleSubmit} noValidate>
          <div className="field-grid">
            <label>Full name *<input name="name" required minLength={2} autoComplete="name" /></label>
            <label>Email *<input name="email" type="email" required autoComplete="email" /></label>
            <label>Phone / WhatsApp *<input name="phone" type="tel" required minLength={8} autoComplete="tel" /></label>
            <label>
              Enquiry type
              <select name="projectType" defaultValue="General inquiry">
                <option>General inquiry</option>
                <option>Business partnership</option>
                <option>Government collaboration</option>
                <option>Investor enquiry</option>
                <option>Research partnership</option>
                <option>Media</option>
              </select>
            </label>
          </div>

          <label>
            Message *
            <textarea name="message" required minLength={20} rows={6} placeholder="What challenge, site, or collaboration should we understand?" />
          </label>

          <div className="checkboxes">
            <label><input type="checkbox" name="consent" required /> I agree to be contacted about this enquiry. *</label>
          </div>

          <button className="button button--primary" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Sending..." : "Send enquiry"}
            <Icon name="arrow" width="18" />
          </button>
          {message ? <p className={`form-message form-message--${status}`} role="status">{message}</p> : null}
        </form>
      </section>

      <Partners />
    </>
  );
}
