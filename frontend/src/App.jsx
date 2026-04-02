import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardHomePage from "./pages/DashboardHomePage";
import NewProjectWrapper from "./pages/NewProjectWrapper";
import ProjectViewPage from "./pages/ProjectViewPage";

/* ─── Ambient Background ─────────────────────────────────────────────────
   Kept on every page except LandingPage (which renders its own canvas).
   The canvas in LandingPage naturally covers this layer (z-index 0 > -10).
────────────────────────────────────────────────────────────────────────── */
function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-surface-0" />

      <div
        className="ambient-orb animate-ambient-1"
        style={{
          width: "55vw",
          height: "55vw",
          top: "-18%",
          left: "-12%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.09) 0%, rgba(99,102,241,0.03) 55%, transparent 75%)",
        }}
      />
      <div
        className="ambient-orb animate-ambient-2"
        style={{
          width: "60vw",
          height: "60vw",
          bottom: "-20%",
          right: "-15%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.07) 0%, rgba(99,102,241,0.03) 50%, transparent 72%)",
        }}
      />
      <div
        className="ambient-orb animate-ambient-3"
        style={{
          width: "40vw",
          height: "40vw",
          top: "35%",
          left: "30%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 65%)",
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}

/* ─── Per-page fade transition ──────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ minHeight: "100vh" }}
      >
        <Routes location={location}>
          {/* ── Public ── */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <DashboardHomePage />
              </ProtectedRoute>
            }
          />
          {/* /dashboard is an alias for /home */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <NewProjectWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-project"
            element={
              <ProtectedRoute>
                <NewProjectWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectViewPage />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all: redirect to /landing ── */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── App Root ───────────────────────────────────────────────────────────── */
export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <BrowserRouter>
      <AmbientBackground />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(18,18,26,0.92)",
            backdropFilter: "blur(16px)",
            color: "#f0f0f5",
            border: "1px solid rgba(255,255,255,0.07)",
            fontSize: "0.875rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#0a0a0f" } },
          error: { iconTheme: { primary: "#fb7185", secondary: "#0a0a0f" } },
        }}
      />

      <AnimatedRoutes />
    </BrowserRouter>
  );
}
