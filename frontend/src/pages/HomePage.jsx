import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Clock, Zap, ExternalLink, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listProjects, deleteProject } from "../services/api";
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
function ProjectCard({ proj, onDelete, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.07 }}
    >
      <Link
        to={`/projects/${proj.id}`}
        className="group flex items-center justify-between p-4 sm:p-5 card-interactive"
        style={{ textDecoration: "none" }}
      >
        {/* Left: info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h3 className="font-medium text-sm text-text-primary truncate">{proj.name}</h3>
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
              {new Date(proj.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Zap size={11} />
              {proj._count?.endpoints || 0} endpoints
            </span>
          </div>
        </div>

        {/* Right: action icons — fade in + slide from right on hover */}
        <div className="flex items-center gap-0.5 ml-4 shrink-0 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
          <span
            className="p-1.5 rounded-md text-text-muted hover:text-accent-light hover:bg-accent/10 transition-colors duration-150 cursor-pointer"
            title="View project"
          >
            <ExternalLink size={13} />
          </span>
          <span
            className="p-1.5 rounded-md text-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-colors duration-150 cursor-pointer"
            title="Edit project"
          >
            <Pencil size={13} />
          </span>
          <motion.button
            onClick={(e) => onDelete(e, proj.id)}
            className="p-1.5 rounded-md text-text-muted hover:text-coral hover:bg-rose-500/10 transition-colors duration-150"
            aria-label="Delete project"
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this project and all its documentation?")) return;
    try {
      await deleteProject(id);
      setProjects((p) => p.filter((proj) => proj.id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between mb-7"
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
          <div className="grid gap-2.5">
            <AnimatePresence mode="popLayout">
              {projects.map((proj, i) => (
                <ProjectCard key={proj.id} proj={proj} onDelete={handleDelete} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
