import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const style = { "--reveal-delay": `${delay * 1000}ms` } as CSSProperties;
  return (
    <div
      ref={elementRef}
      className={`${className ?? ""} reveal-observer${visible ? " reveal-observer--visible" : ""}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
