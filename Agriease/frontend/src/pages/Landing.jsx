import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  Boxes,
  CircleDollarSign,
  Handshake,
  Leaf,
  Menu,
  Moon,
  Sun,
  Route,
  ShieldCheck,
  Smartphone,
  Sprout,
  Store,
  Tractor,
  Truck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "../styles/landing.css";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "roles", label: "Roles" },
  { id: "benefits", label: "Benefits" },
  { id: "contact", label: "Contact" },
];

const FEATURES = [
  {
    title: "Crop Management",
    description: "Track crop lifecycle, schedules, and yield goals from sowing to harvest.",
    icon: Sprout,
  },
  {
    title: "Marketplace",
    description: "Buy and sell agriculture products in a transparent and trusted ecosystem.",
    icon: Store,
  },
  {
    title: "Equipment Rental",
    description: "Book tractors and tools quickly with clear pricing and availability.",
    icon: Tractor,
  },
  {
    title: "AI Disease Detection",
    description: "Upload plant photos and get fast, intelligent disease insights.",
    icon: BrainCircuit,
  },
  {
    title: "Real-Time Notifications",
    description: "Get instant updates for orders, deliveries, and account activity.",
    icon: BellRing,
  },
];

const ROLES = [
  {
    title: "Farmer",
    points: ["Manage crops", "Sell products", "Track orders"],
    icon: Sprout,
    tone: "farmer",
  },
  {
    title: "Supplier",
    points: ["Manage inventory", "Sell or rent equipment", "Track revenue"],
    icon: Store,
    tone: "supplier",
  },
  {
    title: "Delivery Agent",
    points: ["Manage deliveries", "Track orders", "Update status"],
    icon: Truck,
    tone: "agent",
  },
];

const BENEFITS = [
  { title: "Better Pricing", description: "Farmers get fair market access and reduced middlemen margin.", icon: CircleDollarSign },
  { title: "Transparency", description: "Clear visibility for product, order, and delivery lifecycle.", icon: ShieldCheck },
  { title: "Efficient Logistics", description: "Smoother route planning and faster fulfillment for every order.", icon: Route },
  { title: "Easy Platform Access", description: "Responsive interface for mobile and desktop with clean flows.", icon: Smartphone },
];

const sectionVariant = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function scrollToId(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 22,
    mass: 0.4,
  });

  const depth = prefersReducedMotion ? 0 : 1;
  const bgPrimaryY = useTransform(smoothProgress, [0, 1], [0, 90 * depth]);
  const bgPrimaryScale = useTransform(smoothProgress, [0, 1], [1, 1 + 0.08 * depth]);
  const bgLeavesY = useTransform(smoothProgress, [0, 1], [0, -42 * depth]);
  const bgLeavesX = useTransform(smoothProgress, [0, 1], [0, -22 * depth]);
  const bgLeavesRotate = useTransform(smoothProgress, [0, 1], [-8, -8 - 4 * depth]);
  const gradientY = useTransform(smoothProgress, [0, 1], [0, 24 * depth]);

  const card1Y = useTransform(smoothProgress, [0, 1], [0, -44 * depth]);
  const card1X = useTransform(smoothProgress, [0, 1], [0, -16 * depth]);
  const card1Rotate = useTransform(smoothProgress, [0, 1], [0, -3 * depth]);

  const card2Y = useTransform(smoothProgress, [0, 1], [0, 32 * depth]);
  const card2X = useTransform(smoothProgress, [0, 1], [0, 10 * depth]);
  const card2Rotate = useTransform(smoothProgress, [0, 1], [0, 2 * depth]);

  const card3Y = useTransform(smoothProgress, [0, 1], [0, -28 * depth]);
  const card3X = useTransform(smoothProgress, [0, 1], [0, -12 * depth]);
  const card3Rotate = useTransform(smoothProgress, [0, 1], [0, -2 * depth]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    NAV_ITEMS.forEach((item) => {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  const featureCards = useMemo(
    () =>
      FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.article
            key={feature.title}
            className="agri-feature-card"
            variants={sectionVariant}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ delay: index * 0.04 }}
          >
            <span className="agri-icon-pill">
              <Icon size={20} />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.article>
        );
      }),
    []
  );

  return (
    <motion.div
      className="agri-landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <header className="agri-nav-wrap">
        <div className="agri-nav container">
          <button className="agri-brand" onClick={() => scrollToId("home")}>
            <span className="agri-brand-mark">🌿</span>
            <span>AgriEase</span>
          </button>

          <nav className="agri-nav-links" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={activeSection === item.id ? "is-active" : ""}
                onClick={() => scrollToId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="agri-nav-actions">
            <button className="agri-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="agri-link-btn" onClick={() => navigate("/login")}>Login</button>
            <button className="agri-solid-btn" onClick={() => navigate("/register")}>Register</button>
            <button
              className="agri-menu-btn"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            className="agri-mobile-menu"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToId(item.id);
                  setMobileOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
            <button className="agri-link-btn" onClick={() => navigate("/login")}>Login</button>
            <button className="agri-solid-btn" onClick={() => navigate("/register")}>Register</button>
          </motion.div>
        )}
      </header>

      <section className="agri-hero" id="home" ref={heroRef}>
        <div className="agri-hero-bg" aria-hidden="true">
          <motion.img
            className="agri-hero-bg-layer agri-hero-bg-layer--field"
            src="/images/hero-field.jpg"
            alt=""
            style={{ y: bgPrimaryY, scale: bgPrimaryScale }}
          />
          <motion.img
            className="agri-hero-bg-layer agri-hero-bg-layer--leaves"
            src="/images/landing-leaves.jpg"
            alt=""
            style={{ y: bgLeavesY, x: bgLeavesX, rotate: bgLeavesRotate }}
          />
          <motion.div className="agri-hero-gradient" style={{ y: gradientY }} />
        </div>

        <div className="container agri-hero-grid">
          <motion.div
            className="agri-hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="agri-badge">Smart Agriculture Management Platform</span>
            <h1>Smart Farming and Supply Chain Made Easy</h1>
            <p>
              AgriEase connects farmers, suppliers, and delivery agents into one unified ecosystem
              for agriculture operations, marketplace activity, and logistics visibility.
            </p>
            <div className="agri-hero-cta">
              <button className="agri-solid-btn lg" onClick={() => navigate("/register")}>
                Get Started <ArrowRight size={18} />
              </button>
              <button className="agri-glass-btn lg" onClick={() => scrollToId("features")}>
                Explore Features
              </button>
            </div>
          </motion.div>

          <div className="agri-hero-float" aria-hidden="true">
            <motion.div
              className="agri-float-parallax c1"
              style={{ y: card1Y, x: card1X, rotate: card1Rotate }}
            >
              <motion.article
                className="agri-float-card"
                animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
              >
                <h3>Orders This Week</h3>
                <strong>126</strong>
                <p>Up 18% from last week</p>
              </motion.article>
            </motion.div>

            <motion.div
              className="agri-float-parallax c2"
              style={{ y: card2Y, x: card2X, rotate: card2Rotate }}
            >
              <motion.article
                className="agri-float-card"
                animate={prefersReducedMotion ? undefined : { y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              >
                <h3>Healthy Crop Signals</h3>
                <strong>94%</strong>
                <p>AI-powered field diagnostics</p>
              </motion.article>
            </motion.div>

            <motion.div
              className="agri-float-parallax c3"
              style={{ y: card3Y, x: card3X, rotate: card3Rotate }}
            >
              <motion.article
                className="agri-float-card"
                animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
              >
                <h3>Delivery Success Rate</h3>
                <strong>98.4%</strong>
                <p>End-to-end logistics tracking</p>
              </motion.article>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section
        className="agri-about"
        id="about"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <div className="container agri-about-grid">
          <div>
            <p className="agri-kicker">About AgriEase</p>
            <h2>One ecosystem to solve fragmented agriculture workflows</h2>
            <p>
              Traditional agriculture supply chains face disconnected processes, low pricing
              visibility, and delayed coordination. AgriEase unifies operations with a modern,
              data-driven platform built for every role.
            </p>
          </div>

          <div className="agri-about-points">
            <article>
              <span><Handshake size={18} /></span>
              <div>
                <h3>Connected Network</h3>
                <p>Farmers, suppliers, and delivery teams work in one synchronized platform.</p>
              </div>
            </article>
            <article>
              <span><Boxes size={18} /></span>
              <div>
                <h3>End-to-End Visibility</h3>
                <p>Track produce, equipment, and orders from listing to fulfillment.</p>
              </div>
            </article>
            <article>
              <span><Leaf size={18} /></span>
              <div>
                <h3>Smarter Decisions</h3>
                <p>Use AI and analytics to reduce losses and improve yield outcomes.</p>
              </div>
            </article>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="agri-features"
        id="features"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <div className="container">
          <div className="agri-section-head">
            <p className="agri-kicker">Features</p>
            <h2>Purpose-built tools for modern agriculture</h2>
            <p>
              Every workflow is optimized for speed, clarity, and collaboration with smooth,
              mobile-friendly user experiences.
            </p>
          </div>
          <div className="agri-feature-grid">{featureCards}</div>
        </div>
      </motion.section>

      <motion.section
        className="agri-roles"
        id="roles"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <div className="container">
          <div className="agri-section-head">
            <p className="agri-kicker">Roles</p>
            <h2>Built for every role in your agriculture ecosystem</h2>
          </div>

          <div className="agri-role-grid">
            {ROLES.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.article
                  key={role.title}
                  className={`agri-role-card ${role.tone}`}
                  variants={sectionVariant}
                  whileHover={{ y: -8, rotateX: 3 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="agri-role-icon"><Icon size={24} /></span>
                  <h3>{role.title}</h3>
                  <ul>
                    {role.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="agri-benefits"
        id="benefits"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <div className="container">
          <div className="agri-section-head">
            <p className="agri-kicker">Benefits</p>
            <h2>Why teams choose AgriEase</h2>
          </div>
          <div className="agri-benefit-grid">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.article key={benefit.title} className="agri-benefit-card" variants={sectionVariant} whileHover={{ y: -6 }}>
                  <span className="agri-icon-pill"><Icon size={20} /></span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="agri-cta"
        id="contact"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <div className="container">
          <div className="agri-cta-box">
            <img src="/images/landing-tractor.jpg" alt="Agriculture equipment" />
            <div>
              <p className="agri-kicker">Start Now</p>
              <h2>Start Your Smart Agriculture Journey Today</h2>
              <button className="agri-solid-btn lg" onClick={() => navigate("/register")}>
                Create Account <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="agri-footer">
        <div className="container agri-footer-grid">
          <div>
            <div className="agri-footer-brand">AgriEase</div>
            <p>
              Smart agriculture management platform connecting farming, marketplace, and logistics.
            </p>
            <small>Stack: React, Spring Boot, PostgreSQL</small>
          </div>

          <div>
            <h4>Platform</h4>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#roles">Roles</a>
          </div>

          <div>
            <h4>Benefits</h4>
            <a href="#benefits">Pricing Transparency</a>
            <a href="#benefits">Operational Efficiency</a>
            <a href="#benefits">Platform Accessibility</a>
          </div>

          <div>
            <h4>Social</h4>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter/X</a>
            <a href="#">Instagram</a>
          </div>
        </div>

        <div className="container agri-footer-bottom">
          <p>© {new Date().getFullYear()} AgriEase. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}
