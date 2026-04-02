import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, FileText, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchEndpoints, listProjects } from "../services/api";
import { useDebounce } from "../hooks/useAsync";
import MethodBadge from "./MethodBadge";
import { cn } from "../utils/helpers";

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [endpoints, setEndpoints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const debouncedQuery = useDebounce(query, 250);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery("");
      setEndpoints([]);
      setProjects([]);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Search endpoints
  useEffect(() => {
    if (!open) return;
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setEndpoints([]);
      return;
    }
    let cancelled = false;
    setLoadingEndpoints(true);
    searchEndpoints({ q: debouncedQuery, limit: 8 })
      .then((res) => { if (!cancelled) setEndpoints(res.data || []); })
      .catch(() => { if (!cancelled) setEndpoints([]); })
      .finally(() => { if (!cancelled) setLoadingEndpoints(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery, open]);

  // Search projects — filter client-side after fetching all
  useEffect(() => {
    if (!open) return;
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setProjects([]);
      return;
    }
    let cancelled = false;
    setLoadingProjects(true);
    listProjects({ limit: 50 })
      .then((res) => {
        if (!cancelled) {
          const q = debouncedQuery.toLowerCase();
          const filtered = (res.data || []).filter((p) =>
            p.name.toLowerCase().includes(q)
          );
          setProjects(filtered.slice(0, 5));
        }
      })
      .catch(() => { if (!cancelled) setProjects([]); })
      .finally(() => { if (!cancelled) setLoadingProjects(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery, open]);

  const handleSelectProject = (proj) => {
    onClose();
    navigate(`/projects/${proj.id}`);
  };

  const handleSelectEndpoint = (ep) => {
    onClose();
    navigate(`/projects/${ep.project_id}`, { state: { activeEndpointId: ep.id } });
  };

  const isLoading = loadingEndpoints || loadingProjects;
  const hasResults = projects.length > 0 || endpoints.length > 0;
  const showEmpty = debouncedQuery.length >= 2 && !isLoading && !hasResults;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <div className="fixed inset-0 z-[61] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl rounded-2xl overflow-hidden pointer-events-auto"
              style={{
                background: "rgba(14,14,20,0.98)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              {/* Search input row */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <Search size={16} className="text-text-muted shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects and endpoints…"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                <div className="flex items-center gap-2 shrink-0">
                  {isLoading && <Loader2 size={14} className="animate-spin text-text-muted" />}
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-text-muted hover:text-text-secondary transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <kbd
                    className="text-2xs text-text-muted px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    esc
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {!query || query.length < 2 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-text-muted">
                      Type at least 2 characters to search
                    </p>
                  </div>
                ) : showEmpty ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-text-muted">No results for "<span className="text-text-secondary">{query}</span>"</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Projects section */}
                    {projects.length > 0 && (
                      <div>
                        <div className="px-4 py-2 flex items-center gap-2">
                          <FileText size={11} className="text-text-muted" />
                          <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                            Projects
                          </span>
                        </div>
                        {projects.map((proj, i) => (
                          <motion.button
                            key={proj.id}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => handleSelectProject(proj)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2/60 group"
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                            >
                              <FileText size={13} className="text-accent-light" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-text-primary font-medium truncate">{proj.name}</p>
                              <p className="text-2xs text-text-muted">
                                {proj.endpoint_count || 0} endpoints · {proj.status}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Divider between sections */}
                    {projects.length > 0 && endpoints.length > 0 && (
                      <div
                        className="mx-4 my-1"
                        style={{ height: "1px", background: "rgba(255,255,255,0.05)" }}
                      />
                    )}

                    {/* Endpoints section */}
                    {endpoints.length > 0 && (
                      <div>
                        <div className="px-4 py-2 flex items-center gap-2">
                          <Zap size={11} className="text-text-muted" />
                          <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                            Endpoints
                          </span>
                        </div>
                        {endpoints.map((ep, i) => (
                          <motion.button
                            key={ep.id}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (projects.length + i) * 0.03 }}
                            onClick={() => handleSelectEndpoint(ep)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2/60"
                          >
                            <MethodBadge method={ep.method} />
                            <span className="font-mono text-sm text-text-primary truncate flex-1">
                              {ep.path}
                            </span>
                            {ep.project_name && (
                              <span className="text-2xs text-text-muted shrink-0 hidden sm:block">
                                {ep.project_name}
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div
                className="flex items-center gap-4 px-4 py-2.5 border-t"
                style={{
                  borderColor: "rgba(255,255,255,0.05)",
                  background: "rgba(10,10,14,0.8)",
                }}
              >
                <span className="text-2xs text-text-muted">
                  <kbd className={cn(
                    "text-2xs px-1 py-0.5 rounded mr-1",
                  )} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>↵</kbd>
                  to open
                </span>
                <span className="text-2xs text-text-muted">
                  <kbd style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                    className="text-2xs px-1 py-0.5 rounded mr-1">esc</kbd>
                  to close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
