import { useEffect, useRef } from "react";

// Observes an element and adds `.in` when it scrolls into view, which
// triggers the CSS `.reveal` transition in index.css. Fires once.
export function useReveal(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, style: delay ? { transitionDelay: `${delay}ms` } : undefined };
}

// Block-level wrapper for sections that should animate in on scroll.
export default function Reveal({ children, delay = 0, className = "" }) {
  const { ref, style } = useReveal(delay);
  return (
    <div ref={ref} style={style} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
