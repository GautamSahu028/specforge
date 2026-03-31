import { useState } from "react";
import { Menu, X, ChevronRight, FileText } from "lucide-react";
import MethodBadge from "./MethodBadge";
import { cn, groupBy } from "../utils/helpers";

export default function Sidebar({ endpoints = [], activeId, onSelect, projectName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const grouped = groupBy(endpoints, "tag");

  const navContent = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-3">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-accent" />
          <span className="font-semibold text-sm tracking-tight">SpecForge</span>
        </div>
        {projectName && (
          <p className="mt-1.5 text-xs text-text-muted truncate">{projectName}</p>
        )}
      </div>

      {/* Endpoint list */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        {Object.entries(grouped).map(([tag, eps]) => (
          <div key={tag} className="mb-4">
            <h3 className="px-2 mb-1 text-2xs font-semibold uppercase tracking-widest text-text-muted">
              {tag}
            </h3>
            {eps.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  onSelect(ep);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors group",
                  activeId === ep.id
                    ? "bg-accent/10 text-accent-light"
                    : "hover:bg-surface-3 text-text-secondary"
                )}
              >
                <MethodBadge method={ep.method} />
                <span className="text-xs font-mono truncate flex-1">{ep.path}</span>
                <ChevronRight
                  size={12}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    activeId === ep.id && "opacity-100"
                  )}
                />
              </button>
            ))}
          </div>
        ))}
        {endpoints.length === 0 && (
          <p className="text-xs text-text-muted text-center py-8">No endpoints yet</p>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-surface-2 border border-surface-3 rounded-lg"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-surface-1 border-r border-surface-3 h-screen sticky top-0 shrink-0">
        {navContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-surface-1 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-text-primary"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
