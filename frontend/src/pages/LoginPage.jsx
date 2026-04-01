import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* ─── Floating label input ──────────────────────────────────────────────── */
function AuthInput({ id, label, type = "text", value, onChange, disabled, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={[
          "absolute left-4 pointer-events-none transition-all duration-200 select-none",
          lifted
            ? "top-2 text-2xs font-medium text-accent-light/80"
            : "top-1/2 -translate-y-1/2 text-sm text-text-muted",
        ].join(" ")}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        autoComplete={autoComplete}
        className={[
          "w-full pt-6 pb-2.5 px-4 rounded-xl text-sm text-text-primary",
          "bg-surface-2/70 border transition-all duration-200 outline-none",
          "placeholder-transparent backdrop-blur-sm",
          focused
            ? "border-accent/50 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
            : "border-surface-3 hover:border-surface-4",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      />
    </div>
  );
}

/* ─── LoginPage ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/landing";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/landing", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-0">
      {/* Ambient orbs */}
      <div
        className="fixed pointer-events-none"
        style={{
          width: "50vw",
          height: "50vw",
          top: "-10%",
          left: "-10%",
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          width: "40vw",
          height: "40vw",
          bottom: "-10%",
          right: "-5%",
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 4.5h12M3 9h7.5M3 13.5h10.5" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your SpecForge account</p>
        </div>

        {/* Card */}
        <div
          className="glass rounded-2xl p-6"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <AuthInput
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            <AuthInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="mt-1 w-full py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: loading
                  ? "none"
                  : "0 0 0 1px rgba(99,102,241,0.3), 0 4px 16px rgba(99,102,241,0.25)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <path d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-accent-light hover:text-accent transition-colors duration-150 font-medium"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
