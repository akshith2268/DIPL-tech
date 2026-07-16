import { ButtonLink } from "../ui/ButtonLink";
import { Icon } from "../ui/Icon";

export function ContactCta() {
  return (
    <section className="section contact-cta-section">
      <div className="shell contact-cta">
        <div className="contact-cta__content">
          <p className="eyebrow">Connect With Us</p>
          <h2>Discuss Your Project</h2>
          <p>Share your site, challenge, or collaboration goal.</p>
        </div>
        <div className="contact-cta__actions">
          <ButtonLink to="/contact">Contact Us</ButtonLink>
          <a href="mailto:drithinfra.pvt@gmail.com"><Icon name="mail" width="19" />drithinfra.pvt@gmail.com</a>
        </div>
      </div>
    </section>
  );
}
