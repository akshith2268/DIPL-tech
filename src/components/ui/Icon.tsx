import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow"
  | "menu"
  | "close"
  | "expand"
  | "mail"
  | "map"
  | "wave"
  | "leaf"
  | "shield"
  | "check"
  | "home"
  | "folder"
  | "chart"
  | "info"
  | "pen"
  | "phone"
  | "bulb"
  | "instagram"
  | "facebook"
  | "youtube"
  | "linkedin";

interface IconProps extends SVGProps<SVGSVGElement> { name: IconName }

export function Icon({ name, ...props }: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    expand: <><path d="M8 3H3v5" /><path d="m3 3 6 6" /><path d="M16 21h5v-5" /><path d="m21 21-6-6" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    wave: <><path d="M3 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" /><path d="M3 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" /><path d="M3 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" /></>,
    leaf: <><path d="M20 4c-9 0-15 5-15 12 0 2 1 4 3 4 7 0 12-7 12-16Z" /><path d="M4 21c3-6 7-9 12-12" /></>,
    shield: <><path d="M12 3 4.5 6v5.5c0 4.7 3.2 8 7.5 9.5 4.3-1.5 7.5-4.8 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    folder: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z" /></>,
    chart: <><path d="M12 3v18" /><path d="M21 12A9 9 0 1 1 12 3" /><path d="M12 12h9" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6" /><path d="M12 7.5h.01" /></>,
    pen: <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z" /><path d="m14 6 4 4" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1A19.4 19.4 0 0 1 5.2 13 19.8 19.8 0 0 1 2.1 4.4 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" /></>,
    bulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.5 14.5a6 6 0 1 1 7 0c-.8.6-1.2 1.4-1.4 2.5H9.9c-.2-1.1-.6-1.9-1.4-2.5Z" /></>,
    instagram: <><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.5" /><path d="M17.4 6.8h.01" /></>,
    facebook: <path d="M14 8h2V4h-2c-3 0-5 2-5 5v2H7v4h2v5h4v-5h3l.6-4H13V9c0-.6.4-1 1-1Z" />,
    youtube: <><path d="M22 12s0-3.3-.4-4.8c-.2-.8-.9-1.5-1.7-1.7C18.4 5 12 5 12 5s-6.4 0-7.9.5c-.8.2-1.5.9-1.7 1.7C2 8.7 2 12 2 12s0 3.3.4 4.8c.2.8.9 1.5 1.7 1.7 1.5.5 7.9.5 7.9.5s6.4 0 7.9-.5c.8-.2 1.5-.9 1.7-1.7.4-1.5.4-4.8.4-4.8Z" /><path d="m10 9 5 3-5 3Z" /></>,
    linkedin: <><path d="M6.5 10v8" /><path d="M6.5 6.5h.01" /><path d="M11 18v-8" /><path d="M11 13.5c0-2 1.2-3.5 3.2-3.5S18 11.4 18 14v4" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
