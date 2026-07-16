import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icon";

interface ButtonLinkProps {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  showArrow?: boolean;
  className?: string;
}

// Shared internal-link button. Use this for navigation buttons inside the site
// so all buttons inherit the same .button CSS treatment.
export function ButtonLink({ to, children, variant = "primary", showArrow = true, className = "" }: ButtonLinkProps) {
  return <Link className={`button button--${variant} ${className}`.trim()} to={to}><span>{children}</span>{showArrow ? <Icon name="arrow" width="18" height="18" /> : null}</Link>;
}
