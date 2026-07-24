import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assets } from "../../config/assets";
import { navigation } from "../../data";
import { Icon } from "../ui/Icon";

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = location.pathname.replace(/\/$/, "") || "/";
  const isHome = pathname === "/";

  return (
    <header className={`site-header ${isHome ? "site-header--home" : ""} ${isMenuOpen ? "site-header--menu-open" : ""}`.trim()}>
      <div className={`site-header__inner shell ${isHome ? "" : "glass-panel"}`.trim()}>
        <Link className="brand brand--wordmark" to="/" aria-label="Drith Infra home" onClick={() => setIsMenuOpen(false)}>
          <img src={assets.brand.wordmark} alt="" width="220" height="76" decoding="async" />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.href === "/"}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link className="header-cta" to="/contact" onClick={() => setIsMenuOpen(false)}>
          <span>Contact Us</span>
          <span className="header-cta__arrow" aria-hidden="true">{"\u2192"}</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <Icon name={isMenuOpen ? "close" : "menu"} width="22" height="22" />
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className={`mobile-nav glass-panel ${isMenuOpen ? "mobile-nav--open" : ""}`.trim()}
        aria-label="Mobile navigation"
      >
        {navigation.map((item) => (
          <NavLink key={item.href} to={item.href} end={item.href === "/"} onClick={() => setIsMenuOpen(false)}>
            {item.label}
          </NavLink>
        ))}
        <Link className="button button--primary" to="/contact" onClick={() => setIsMenuOpen(false)}>
          <span>Contact Us</span>
          <Icon name="arrow" width="18" height="18" />
        </Link>
      </nav>
    </header>
  );
}
