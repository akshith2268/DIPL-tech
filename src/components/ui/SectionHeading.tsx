export function SectionHeading({ eyebrow, title, body, align = "left" }: { eyebrow?: string; title?: string; body?: string; align?: "left" | "center" }) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2>{title}</h2> : null}
      {body ? <p className="section-heading__body">{body}</p> : null}
    </header>
  );
}
