import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Trash2, Clock, Zap, ExternalLink, Pencil, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listProjects, deleteProject, renameProject } from "../services/api";
import { LoadingState, EmptyState } from "../components/States";
import { cn } from "../utils/helpers";
import toast from "react-hot-toast";

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  COMPLETED:  "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  FAILED:     "bg-rose-500/10   text-rose-400    ring-1 ring-rose-500/20",
  PENDING:    "bg-amber-500/10  text-amber-400   ring-1 ring-amber-500/20",
  PARSING:    "bg-blue-500/10   text-blue-400    ring-1 ring-blue-500/20",
  GENERATING: "bg-indigo-500/10 text-indigo-400  ring-1 ring-indigo-500/20",
};

/* ─── Project card ───────────────────────────────────────────────────────── */
function ProjectCard({ proj, onDelete, onRename, index }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(proj.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const startEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraft(proj.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditing(false);
    setDraft(proj.name);
  };

  const commitEdit = async (e) => {
    e?.stopPropagation();
    const trimmed = draft.trim();
    if (!trimmed || trimmed === proj.name) { cancelEdit(); return; }
    setSaving(true);
    try {
      await onRename(proj.id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitEdit(e);
    if (e.key === "Escape") cancelEdit(e);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.07 }}
    >
      <Link
        to={editing ? "#" : `/projects/${proj.id}`}
        onClick={editing ? (e) => e.preventDefault() : undefined}
        className="group flex items-center justify-between p-4 sm:p-5 card-interactive"
        style={{ textDecoration: "none" }}
      >
        {/* Left: info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-1.5">
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.preventDefault()}
                disabled={saving}
                className="font-medium text-sm text-text-primary bg-surface-2 border border-accent/40 rounded-md px-2 py-0.5 outline-none focus:ring-1 focus:ring-accent/50 min-w-0 w-48"
                autoFocus
              />
            ) : (
              <h3 className="font-medium text-sm text-text-primary truncate">{proj.name}</h3>
            )}
            <span
              className={cn(
                "text-2xs px-1.5 py-0.5 rounded-full font-medium shrink-0",
                STATUS_STYLES[proj.status] || "bg-surface-3 text-text-muted"
              )}
            >
              {proj.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(proj.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Zap size={11} />
              {proj.endpoint_count || 0} endpoints
            </span>
          </div>
        </div>

        {/* Right: action icons */}
        <div className="flex items-center gap-0.5 ml-4 shrink-0">
          {editing ? (
            <>
              <motion.button
                onClick={commitEdit}
                disabled={saving}
                className="p-1.5 rounded-md text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-150 disabled:opacity-40"
                aria-label="Save name"
                whileTap={{ scale: 0.9 }}
              >
                <Check size={13} />
              </motion.button>
              <motion.button
                onClick={cancelEdit}
                className="p-1.5 rounded-md text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150"
                aria-label="Cancel"
                whileTap={{ scale: 0.9 }}
              >
                <X size={13} />
              </motion.button>
            </>
          ) : (
            <div className="opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out flex items-center gap-0.5">
              <Link
                to={`/projects/${proj.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md text-text-muted hover:text-accent-light hover:bg-accent/10 transition-colors duration-150"
                title="View project"
              >
                <ExternalLink size={13} />
              </Link>
              <motion.button
                onClick={startEdit}
                className="p-1.5 rounded-md text-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-colors duration-150"
                title="Rename project"
                whileTap={{ scale: 0.9 }}
              >
                <Pencil size={13} />
              </motion.button>
              <motion.button
                onClick={(e) => onDelete(e, proj.id)}
                className="p-1.5 rounded-md text-text-muted hover:text-coral hover:bg-rose-500/10 transition-colors duration-150"
                aria-label="Delete project"
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={13} />
              </motion.button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

const PAGE_SIZE = 4;

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await listProjects({ limit: 50 });
      setProjects(res.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRename = async (id, name) => {
    try {
      await renameProject(id, name);
      setProjects((p) => p.map((proj) => proj.id === id ? { ...proj, name } : proj));
      toast.success("Project renamed");
    } catch {
      toast.error("Failed to rename");
      throw new Error("rename failed");
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this project and all its documentation?")) return;
    try {
      await deleteProject(id);
      setProjects((p) => {
        const updated = p.filter((proj) => proj.id !== id);
        // if deleting the last item on a non-first page, step back
        const totalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
        setPage((cur) => Math.min(cur, totalPages));
        return updated;
      });
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const paged = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen">
      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7"
        >
          <div>
            <h2 className="text-base font-semibold text-text-primary">Your Projects</h2>
            {!loading && projects.length > 0 && (
              <p className="text-xs text-text-muted mt-0.5">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>

        {/* List */}
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started with AI-powered documentation."
          />
        ) : (
          <>
            <div className="grid gap-2.5">
              <AnimatePresence mode="popLayout">
                {paged.map((proj, i) => (
                  <ProjectCard key={proj.id} proj={proj} onDelete={handleDelete} onRename={handleRename} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination — only shown when there's more than one page */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex items-center justify-between mt-6"
              >
                <p className="text-xs text-text-muted">
                  Page {page} of {totalPages}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary"
                    style={{
                      background: "rgba(36,36,51,0.6)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <ChevronLeft size={13} />
                    Prev
                  </button>

                  {/* Page number pills */}
                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className="w-7 h-7 text-xs rounded-lg transition-all duration-200 font-medium"
                        style={
                          n === page
                            ? { background: "rgba(99,102,241,0.85)", color: "#fff", border: "1px solid rgba(99,102,241,0.4)" }
                            : { background: "rgba(36,36,51,0.6)", color: "#6b6b80", border: "1px solid rgba(255,255,255,0.06)" }
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary"
                    style={{
                      background: "rgba(36,36,51,0.6)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    Next
                    <ChevronRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
