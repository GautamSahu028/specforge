import { motion } from "framer-motion";
import { AlertTriangle, FileQuestion, RefreshCw } from "lucide-react";

/* ─── Loading state — orbital spinner ───────────────────────────────────── */
export function LoadingState({ message = "Loading…" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20"
    >
      {/* Orbital rings */}
      <div className="relative w-12 h-12 mb-5 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(99,102,241,0.15)" }}
        />
        <div
          className="absolute inset-[-6px] rounded-full"
          style={{ border: "1px solid rgba(99,102,241,0.07)" }}
        />
        {/* Orbiting dot — outer */}
        <div
          className="absolute w-2 h-2 rounded-full bg-accent-light animate-orbit"
          style={{ top: "50%", left: "50%", marginTop: "-4px", marginLeft: "-4px" }}
        />
        {/* Orbiting dot — inner */}
        <div
          className="absolute w-1.5 h-1.5 rounded-full animate-orbit-reverse"
          style={{
            top: "50%",
            left: "50%",
            marginTop: "-3px",
            marginLeft: "-3px",
            background: "rgba(129,140,248,0.5)",
          }}
        />
        {/* Core pulse */}
        <div className="w-2 h-2 rounded-full bg-accent/40 animate-pulse" />
      </div>

      <p className="text-sm text-text-muted">{message}</p>
    </motion.div>
  );
}

/* ─── Error state ────────────────────────────────────────────────────────── */
export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{
          background: "rgba(251,113,133,0.08)",
          border: "1px solid rgba(251,113,133,0.18)",
        }}
      >
        <AlertTriangle size={20} className="text-coral" />
      </div>

      <p className="text-sm text-text-secondary mb-5 text-center max-w-xs leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <motion.button
          onClick={onRetry}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200"
          style={{
            background: "rgba(36,36,51,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#a1a1b5",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(46,46,64,0.9)";
            e.currentTarget.style.color = "#f0f0f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(36,36,51,0.7)";
            e.currentTarget.style.color = "#a1a1b5";
          }}
        >
          <RefreshCw size={13} />
          Retry
        </motion.button>
      )}
    </motion.div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
export function EmptyState({ title = "Nothing here yet", description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{
          background: "rgba(99,102,241,0.07)",
          border: "1px solid rgba(99,102,241,0.13)",
        }}
      >
        <FileQuestion size={20} className="text-text-muted" />
      </div>

      <p className="text-sm font-medium text-text-secondary mb-1.5">{title}</p>
      {description && (
        <p className="text-xs text-text-muted max-w-xs leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
