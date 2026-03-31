import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileText, Trash2, Clock, Loader2 } from "lucide-react";
import { listProjects, deleteProject } from "../services/api";
import MethodBadge from "../components/MethodBadge";
import { LoadingState, EmptyState } from "../components/States";
import { cn } from "../utils/helpers";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400",
  FAILED: "bg-rose-500/10 text-rose-400",
  PENDING: "bg-amber-500/10 text-amber-400",
  PARSING: "bg-blue-500/10 text-blue-400",
  GENERATING: "bg-indigo-500/10 text-indigo-400",
};

export default function HomePage() {
  const navigate = useNavigate();
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
      {/* Header */}
      <header className="border-b border-surface-3 bg-surface-1/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-accent" />
            <h1 className="font-semibold tracking-tight">SpecForge</h1>
          </div>
          <button
            onClick={() => navigate("/new")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-accent hover:bg-accent-dim text-white rounded-lg transition-colors"
          >
            <Plus size={14} />
            New Project
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-lg font-semibold mb-6">Your Projects</h2>

        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started with AI-powered documentation."
          />
        ) : (
          <div className="grid gap-3">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                to={`/projects/${proj.id}`}
                className="group flex items-center justify-between p-4 bg-surface-1 border border-surface-3 rounded-lg hover:border-surface-4 hover:bg-surface-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{proj.name}</h3>
                    <span className={cn("text-2xs px-1.5 py-0.5 rounded font-medium", STATUS_STYLES[proj.status] || "bg-surface-3 text-text-muted")}>
                      {proj.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    <span>{proj._count?.endpoints || 0} endpoints</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, proj.id)}
                  className="p-2 text-text-muted hover:text-coral opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Delete project"
                >
                  <Trash2 size={14} />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
