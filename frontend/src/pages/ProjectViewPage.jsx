import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { getProject, exportMarkdown } from "../services/api";
import Sidebar from "../components/Sidebar";
import EndpointPage from "../components/EndpointPage";
import SearchBar from "../components/SearchBar";
import { LoadingState, ErrorState } from "../components/States";
import { downloadFile } from "../utils/helpers";
import toast from "react-hot-toast";

export default function ProjectViewPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState(null);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProject(id);
      setProject(res.data);
      if (res.data.endpoints?.length > 0 && !activeEndpoint) {
        setActiveEndpoint(res.data.endpoints[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleExport = async () => {
    try {
      const markdown = await exportMarkdown(id);
      downloadFile(markdown, `${project?.name || "api-docs"}.md`);
      toast.success("Markdown exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  if (loading) return <LoadingState message="Loading project..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProject} />;
  if (!project) return <ErrorState message="Project not found" />;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        endpoints={project.endpoints || []}
        activeId={activeEndpoint?.id}
        onSelect={setActiveEndpoint}
        projectName={project.name}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-md border-b border-surface-3">
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
            {/* Spacer for mobile hamburger */}
            <div className="w-10 lg:hidden" />

            <SearchBar
              projectId={id}
              onSelect={setActiveEndpoint}
              className="flex-1 max-w-md"
            />

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-surface-2 hover:bg-surface-3 border border-surface-3 rounded-lg transition-colors shrink-0"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export MD</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
          <EndpointPage endpoint={activeEndpoint} />
        </div>
      </main>
    </div>
  );
}
