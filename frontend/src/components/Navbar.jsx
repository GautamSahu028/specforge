import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import CommandPalette from "./CommandPalette";
import toast from "react-hot-toast";

/* ─── Scroll-direction hook ─────────────────────────────────────────────── */
function useScrollVisibility() {
  const [visible, setVisible] = useState(true);
  const prevY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setVisible(true);
      } else if (currentY > prevY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      prevY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}

/* ─── Nav link ───────────────────────────────────────────────────────────── */
function NavLink({ to, children, className = "" }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={[
        "relative px-3 py-1.5 text-sm font-medium transition-colors duration-200",
        isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
        className,
      ].join(" ")}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-md bg-surface-3/70"
          style={{ zIndex: -1 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
    </Link>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const visible = useScrollVisibility();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleLogout = async () => {
    navigate("/login", { replace: true });
    await logout();
    toast.success("Signed out successfully");
  };

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isAuthenticated]);

  return (
    <>
      <motion.nav
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        initial={false}
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3"
      >
        <div
          className="w-full max-w-5xl flex items-center justify-between px-4 py-2.5 rounded-xl glass"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Logo */}
          <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2 group shrink-0">
            <div className="w-6 h-6 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M2 6h5M2 9h7" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-text-primary group-hover:text-accent-light transition-colors duration-200">
              SpecForge
            </span>
          </Link>

          {/* Search trigger — only when authenticated */}
          {isAuthenticated && (
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-text-muted transition-all duration-200 hover:text-text-secondary mx-4 flex-1 max-w-xs"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <Search size={13} className="shrink-0" />
              <span className="flex-1 text-left text-xs">Search projects &amp; endpoints…</span>
              <kbd
                className="text-2xs px-1.5 py-0.5 rounded hidden sm:block"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#6b6b80",
                }}
              >
                ⌘K
              </kbd>
            </button>
          )}

          {/* Nav links */}
          <div className="flex items-center gap-1 shrink-0">
            {isAuthenticated ? (
              <>
                <NavLink to="/home">Home</NavLink>
                <NavLink to="/new-project">New Project</NavLink>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-coral transition-colors duration-200 rounded-md hover:bg-coral/10"
                >
                  Logout
                </button>
                {user && (
                  <div className="ml-2 w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent-light select-none">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </>
            ) : (
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/about">About</NavLink>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="ml-1 px-3 py-1.5 text-sm font-medium text-white rounded-lg btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
