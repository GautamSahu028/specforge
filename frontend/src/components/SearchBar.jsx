import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../hooks/useAsync";
import { searchEndpoints } from "../services/api";
import MethodBadge from "./MethodBadge";
import { cn } from "../utils/helpers";

export default function SearchBar({ projectId, onSelect, className }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchEndpoints({ q: debouncedQuery, projectId, limit: 10 })
      .then((res) => {
        if (!cancelled) setResults(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery, projectId]);

  const handleSelect = (endpoint) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    onSelect?.(endpoint);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search endpoints…"
          className={cn(
            "w-full pl-8 pr-8 py-2 text-sm rounded-lg transition-all duration-200",
            "text-text-primary placeholder:text-text-muted",
            "focus:outline-none"
          )}
          style={{
            background: "rgba(26,26,38,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onClick={() => { setQuery(""); setResults([]); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={13} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden max-h-64 overflow-y-auto"
            style={{
              background: "rgba(18,18,26,0.97)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-text-muted text-sm">
                <Loader2 size={15} className="animate-spin" />
                Searching…
              </div>
            ) : results.length > 0 ? (
              results.map((ep, i) => (
                <motion.button
                  key={ep.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  onClick={() => handleSelect(ep)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-3/50"
                >
                  <MethodBadge method={ep.method} />
                  <span className="font-mono text-sm text-text-primary truncate">{ep.path}</span>
                  {ep.summary && (
                    <span className="text-xs text-text-muted truncate ml-auto hidden sm:block">
                      {ep.summary}
                    </span>
                  )}
                </motion.button>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-text-muted">
                No endpoints found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-away */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
