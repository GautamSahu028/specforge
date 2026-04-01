import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useAuth } from "../context/AuthContext";

/* ─── Particle system ─────────────────────────────────────────────────────
   Pure canvas — no Three.js dependency, identical visual quality for 2-D.
   ~100 nodes on desktop, ~55 on mobile.  Lines drawn between any two
   nodes closer than CONNECTION_DIST px.  Mouse exerts a soft repulsion field.
────────────────────────────────────────────────────────────────────────── */

const CONNECTION_DIST = 140;
const REPEL_RADIUS = 130;
const REPEL_STRENGTH = 1.1;

const PALETTE = [
  "99,102,241",  // indigo
  "139,92,246",  // violet
  "59,130,246",  // blue
  "168,85,247",  // purple
  "79,70,229",   // indigo-dim
];

class Particle {
  constructor(w, h) {
    this.reset(w, h);
  }

  reset(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r = Math.random() * 1.8 + 0.4;
    this.alpha = Math.random() * 0.55 + 0.2;
    this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    this.w = w;
    this.h = h;
  }

  update(mx, my) {
    this.x += this.vx;
    this.y += this.vy;

    // Soft mouse repulsion
    if (mx !== null && my !== null) {
      const dx = this.x - mx;
      const dy = this.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 0.1) {
        const f = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
        this.x += (dx / dist) * f;
        this.y += (dy / dist) * f;
      }
    }

    // Wrap edges
    if (this.x < -5) this.x = this.w + 5;
    if (this.x > this.w + 5) this.x = -5;
    if (this.y < -5) this.y = this.h + 5;
    if (this.y > this.h + 5) this.y = -5;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.fill();
  }
}

function useParticleCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null });
  const particles = useRef([]);
  const rafId = useRef(null);
  const dpr = useRef(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 55 : 105;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const d = dpr.current;
      canvas.width = w * d;
      canvas.height = h * d;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(d, d);
      particles.current = Array.from({ length: COUNT }, () => new Particle(w, h));
    }

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Background gradient
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.72);
      bg.addColorStop(0, "rgba(14,12,28,1)");
      bg.addColorStop(0.55, "rgba(8,8,18,1)");
      bg.addColorStop(1, "rgba(4,4,10,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const pts = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Update & draw nodes
      for (const p of pts) {
        p.w = w;
        p.h = h;
        p.update(mx, my);
        p.draw(ctx);
      }

      // Draw connecting lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            const a = (1 - d / CONNECTION_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${a})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      rafId.current = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const onResize = () => {
      cancelAnimationFrame(rafId.current);
      resize();
      draw();
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouse.current = { x: null, y: null };
    };

    window.addEventListener("resize", onResize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return canvasRef;
}

/* ─── Feature card (scroll-triggered) ──────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h9M3 15h11" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Parse any API",
    desc: "Feed raw source code or an OpenAPI spec — SpecForge extracts every endpoint automatically.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="#818cf8" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "AI-generated docs",
    desc: "Groq-powered LLMs write clean descriptions, parameter tables, and code examples instantly.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="#818cf8" strokeWidth="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="#818cf8" strokeWidth="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="#818cf8" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="#818cf8" strokeWidth="1.5" />
      </svg>
    ),
    title: "Beautiful navigation",
    desc: "Grouped sidebar, full-text search, syntax-highlighted code blocks — ready to share.",
  },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-xl p-6 flex flex-col gap-3 hover:border-accent/20 transition-all duration-300"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}
    >
      <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
        {feature.icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary">{feature.title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
}

/* ─── LandingPage ────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const canvasRef = useParticleCanvas();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transitioning, setTransitioning] = useState(false);
  const featuresRef = useRef(null);

  const handleEnter = () => {
    setTransitioning(true);
    // navigate is called inside onAnimationComplete of the overlay
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ── Canvas background ── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ zIndex: 0 }}
      />

      {/* ── Vignette overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 42%, transparent 40%, rgba(4,4,10,0.7) 100%)",
        }}
      />

      {/* ── Minimal top bar ── */}
      <header
        className="fixed top-0 inset-x-0 z-20 flex justify-between items-center px-6 py-4"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex items-center gap-2" style={{ pointerEvents: "auto" }}>
          <div className="w-6 h-6 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M2 6h5M2 9h7" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">SpecForge</span>
        </div>
        {user && (
          <div className="flex items-center gap-2" style={{ pointerEvents: "auto" }}>
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent-light">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-text-muted">{user.name}</span>
          </div>
        )}
      </header>

      {/* ── Hero section ── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-center px-6"
        style={{ zIndex: 10 }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-xs font-semibold tracking-[0.2em] uppercase text-accent-light/70"
        >
          AI-Powered API Documentation
        </motion.p>

        {/* Main heading — split into lines for stagger */}
        <div className="overflow-hidden mb-3">
          <motion.h1
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary leading-[1.05] tracking-tight"
          >
            Turn APIs into
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight shimmer-text"
          >
            Living Documentation
          </motion.h1>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md text-base md:text-lg text-text-secondary mb-12 leading-relaxed"
        >
          From raw source code to beautiful, navigable docs — powered by AI.
          Zero config, instant results.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <motion.button
            onClick={handleEnter}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            disabled={transitioning}
            className="group relative px-8 py-3.5 text-sm font-semibold text-white rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #4f46e5 100%)",
              boxShadow:
                "0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px rgba(99,102,241,0.35), 0 1px 0 rgba(255,255,255,0.12) inset",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Enter Experience
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {/* shimmer sweep */}
            <span
              className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
              }}
            />
          </motion.button>

          <button
            onClick={() =>
              featuresRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-6 py-3.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-xl border border-surface-3 hover:border-surface-4 hover:bg-surface-1/50"
          >
            Learn more
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <span className="text-2xs text-text-muted tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-6 bg-gradient-to-b from-text-muted to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Features section ── */}
      <section
        ref={featuresRef}
        className="relative py-24 px-6"
        style={{ zIndex: 10 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <SectionReveal>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-accent-light/60 mb-3">
                What it does
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
                Everything a doc reader expects
              </h2>
            </SectionReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA section ── */}
      <section className="relative py-28 px-6" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto text-center">
          <SectionReveal>
            <div
              className="rounded-2xl p-10 glass"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.05) 100%)",
                boxShadow:
                  "0 0 0 1px rgba(99,102,241,0.12), 0 8px 40px rgba(0,0,0,0.4)",
              }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Ready to ship better docs?
              </h2>
              <p className="text-text-secondary mb-8">
                Join developers who automate the boring part of API documentation.
              </p>
              <motion.button
                onClick={handleEnter}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary px-8 py-3 text-sm"
              >
                Get started — it's free
              </motion.button>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative py-8 px-6 border-t border-surface-2" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>© 2026 SpecForge</span>
          <span>Built with FastAPI · React · Groq</span>
        </div>
      </footer>

      {/* ── Page-exit transition overlay ── */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="fixed inset-0 bg-surface-0"
            style={{ zIndex: 100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: "easeIn" }}
            onAnimationComplete={() => navigate("/home")}
          />
        )}
      </AnimatePresence>

      {/* Simultaneous zoom-out effect on hero content */}
      {transitioning && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 50 }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.06, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </div>
  );
}

/* ─── Utility: scroll-triggered section reveal ───────────────────────────── */
function SectionReveal({ children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
