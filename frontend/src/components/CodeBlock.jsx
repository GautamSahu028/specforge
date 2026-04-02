import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, copyToClipboard } from "../utils/helpers";

/* Terminal window dots */
const DOT_COLORS = ["#fb7185", "#fbbf24", "#34d399"];

/* Normalize code strings that were double-serialized (contain literal \" escapes).
   1. If the whole string is a JSON-encoded string, decode it once.
   2. If it looks like JSON content with escaped quotes, unescape them.
   3. If the result is valid JSON, pretty-print it.
   4. Otherwise return as-is. */
function normalizeCode(raw) {
  if (typeof raw !== "string") return raw;

  let str = raw;

  // Step 1: if the entire value is a JSON-encoded string (starts/ends with "), decode it
  if (str.startsWith('"') && str.endsWith('"')) {
    try { str = JSON.parse(str); } catch {}
  }

  // Step 2: unescape literal \" → " (double-serialized objects)
  if (str.includes('\\"')) {
    str = str.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  }

  // Step 3: if result is valid JSON, pretty-print it
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === "object" && parsed !== null) {
      return JSON.stringify(parsed, null, 2);
    }
  } catch {}

  return str;
}

export default function CodeBlock({ code, language, title, className }) {
  const [copied, setCopied] = useState(false);
  const displayCode = normalizeCode(code);

  const handleCopy = async () => {
    await copyToClipboard(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn("rounded-xl overflow-hidden", className)}
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: "rgba(18,18,26,0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Terminal dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {DOT_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color, opacity: 0.6 }}
              />
            ))}
          </div>

          {/* Labels */}
          <div className="flex items-center gap-2">
            {language && (
              <span className="text-2xs font-mono uppercase tracking-wider text-text-muted">
                {language}
              </span>
            )}
            {title && (
              <span className="text-xs text-text-muted/70 hidden sm:inline truncate max-w-xs">
                {title}
              </span>
            )}
          </div>
        </div>

        {/* Copy button */}
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
          style={{ color: copied ? "#34d399" : "#6b6b80" }}
          onMouseEnter={(e) => {
            if (!copied) e.currentTarget.style.color = "#a1a1b5";
          }}
          onMouseLeave={(e) => {
            if (!copied) e.currentTarget.style.color = "#6b6b80";
          }}
          aria-label="Copy code"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <Check size={13} />
                <span>Copied</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <Copy size={13} />
                <span className="hidden sm:inline">Copy</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Code body ── */}
      <div
        className="overflow-x-auto"
        style={{ background: "rgba(10,10,15,0.95)" }}
      >
        <pre className="p-4 text-sm font-mono leading-relaxed text-text-primary">
          <code>{displayCode}</code>
        </pre>
      </div>
    </div>
  );
}
