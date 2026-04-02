import { useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MethodBadge from "./MethodBadge";
import { cn, groupBy } from "../utils/helpers";

/* ─── Nav content (shared between desktop and mobile) ───────────────────── */
function NavContent({ endpoints, activeId, onSelect, projectName, onClose }) {
  const navigate = useNavigate();
  const grouped = groupBy(endpoints, "tag");

  return (
    <nav className="flex flex-col h-full">
      {/* Logo / project name */}
      <div className="px-5 py-5 border-b border-white/[0.05] shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="p-1.5 rounded-lg bg-accent/10 ring-1 ring-accent/20">
              <FileText size={14} className="text-accent-light" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-text-primary">
              Spec<span className="text-accent-light">Forge</span>
            </span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-md hover:bg-surface-3"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {projectName && (
          <p className="mt-2 text-xs text-text-muted truncate pl-0.5">{projectName}</p>
        )}
      </div>

      {/* Endpoint list */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        {Object.entries(grouped).map(([tag, eps]) => (
          <div key={tag} className="mb-5">
            <h3 className="px-2 mb-1.5 text-2xs font-semibold uppercase tracking-widest text-text-muted/70">
              {tag}
            </h3>
            <div className="space-y-0.5">
              {eps.map((ep) => {
                const isActive = activeId === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      onSelect(ep);
                      onClose?.();
                    }}
                    className={cn(
                      "relative w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all duration-200 group",
                      isActive
                        ? "text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-3/60"
                    )}
                  >
                    {/* Active background */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bg"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: "rgba(99,102,241,0.1)",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}

                    <span className="relative z-10">
                      <MethodBadge method={ep.method} />
                    </span>
                    <span className="relative z-10 text-xs font-mono truncate flex-1">
                      {ep.path}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {endpoints.length === 0 && (
          <p className="text-xs text-text-muted text-center py-8">No endpoints yet</p>
        )}
      </div>
    </nav>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
export default function Sidebar({ endpoints = [], activeId, onSelect, projectName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <motion.button
        onClick={() => setMobileOpen(true)}
        whileTap={{ scale: 0.93 }}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg"
        style={{
          background: "rgba(18,18,26,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
        aria-label="Open sidebar"
      >
        <Menu size={18} className="text-text-secondary" />
      </motion.button>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 h-screen sticky top-0 shrink-0"
        style={{
          background: "rgba(12,12,18,0.75)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <NavContent
          endpoints={endpoints}
          activeId={activeId}
          onSelect={onSelect}
          projectName={projectName}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 bg-black/60"
              style={{ backdropFilter: "blur(4px)" }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-72 max-w-[85vw] h-full shadow-2xl"
              style={{
                background: "rgba(12,12,18,0.97)",
                borderRight: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <NavContent
                endpoints={endpoints}
                activeId={activeId}
                onSelect={onSelect}
                projectName={projectName}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
