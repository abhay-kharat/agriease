import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REVEAL_SELECTOR = [
  ".secondary-page .page-hero",
  ".secondary-page .smart-hero",
  ".secondary-page .profile-card",
  ".secondary-page .stat-card",
  ".secondary-page .market-v2-card",
  ".secondary-page .dashboard-panel",
  ".secondary-page .dashboard-summary-card",
  ".secondary-page .dashboard-widget-card",
  ".secondary-page .supplier-section",
  ".secondary-page .farmer-section",
  ".role-dashboard section",
  ".role-dashboard .dashboard-quick-card",
  ".role-dashboard .dashboard-stat-card",
  ".role-dashboard .dashboard-panel",
  ".agent-card",
  ".agent-stat-card",
  ".agri-auth-card",
  ".agri-auth-content-panel",
].join(",");

const HERO_PARALLAX_SELECTOR = [
  ".secondary-page .page-hero",
  ".secondary-page .smart-hero",
].join(",");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function GlobalPageEffects() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR));

    targets.forEach((node, index) => {
      node.classList.add("ui-reveal-target");
      node.style.setProperty("--ui-reveal-delay", `${Math.min(index % 8, 7) * 0.06}s`);
    });

    if (reduceMotion) {
      targets.forEach((node) => node.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    targets.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const heroes = Array.from(document.querySelectorAll(HERO_PARALLAX_SELECTOR));
    if (heroes.length === 0) return;

    let rafId = 0;

    const updateParallax = () => {
      const viewportCenter = window.innerHeight * 0.5;
      heroes.forEach((hero) => {
        const rect = hero.getBoundingClientRect();
        const heroCenter = rect.top + rect.height * 0.5;
        const distance = heroCenter - viewportCenter;
        const shift = clamp((-distance / window.innerHeight) * 22, -20, 20);
        hero.style.setProperty("--hero-parallax-y", `${shift.toFixed(2)}px`);
      });
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  return null;
}
