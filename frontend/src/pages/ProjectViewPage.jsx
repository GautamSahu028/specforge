import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Download, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProject, exportMarkdown } from "../services/api";
import Sidebar from "../components/Sidebar";
import EndpointPage from "../components/EndpointPage";
import SearchBar from "../components/SearchBar";
import { LoadingState, ErrorState } from "../components/States";
import { downloadFile, groupBy } from "../utils/helpers";
import toast from "react-hot-toast";

/* ─── HTML export generator ──────────────────────────────────────────────── */
function generateHtml(project) {
  const { name, endpoints = [] } = project;

  const grouped = groupBy(endpoints, "tag");

  const escape = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const methodBg = {
    GET: "#166534",
    POST: "#1e3a5f",
    PUT: "#78350f",
    PATCH: "#4c1d95",
    DELETE: "#7f1d1d",
  };
  const methodFg = {
    GET: "#4ade80",
    POST: "#60a5fa",
    PUT: "#fbbf24",
    PATCH: "#c4b5fd",
    DELETE: "#f87171",
  };

  const sidebarHtml = Object.entries(grouped)
    .map(
      ([tag, eps]) => `
    <div style="margin-bottom:20px">
      <h3 style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;margin:0 0 6px 0">${escape(tag)}</h3>
      ${eps
        .map(
          (ep) => `
        <a href="#ep-${escape(ep.id)}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;text-decoration:none;color:#d1d5db;font-size:12px;font-family:monospace">
          <span style="background:${methodBg[ep.method] || "#1f2937"};color:${methodFg[ep.method] || "#9ca3af"};font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;font-family:monospace">${escape(ep.method)}</span>
          ${escape(ep.path)}
        </a>`
        )
        .join("")}
    </div>`
    )
    .join("");

  const mainHtml = endpoints
    .map(
      (ep) => `
    <section id="ep-${escape(ep.id)}" style="margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid #1f2937">
      <div style="display:flex;align-items:center;gap:12px;background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px 16px;margin-bottom:12px">
        <span style="background:${methodBg[ep.method] || "#1f2937"};color:${methodFg[ep.method] || "#9ca3af"};font-size:11px;font-weight:700;padding:3px 8px;border-radius:5px;font-family:monospace">${escape(ep.method)}</span>
        <code style="font-family:monospace;font-size:15px;color:#f1f5f9">${escape(ep.path)}</code>
      </div>
      ${ep.summary ? `<p style="font-size:13px;color:#94a3b8;margin:0 0 8px 2px">${escape(ep.summary)}</p>` : ""}
      ${ep.description ? `<p style="font-size:13px;color:#64748b;margin:0 0 16px 2px;line-height:1.6">${escape(ep.description)}</p>` : ""}
      ${
        ep.parameters?.length
          ? `<h4 style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin:16px 0 8px">Parameters</h4>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#0f172a;border-bottom:1px solid #1e293b">
              <th style="text-align:left;padding:8px 12px;color:#6b7280;font-weight:600">Name</th>
              <th style="text-align:left;padding:8px 12px;color:#6b7280;font-weight:600">In</th>
              <th style="text-align:left;padding:8px 12px;color:#6b7280;font-weight:600">Type</th>
              <th style="text-align:left;padding:8px 12px;color:#6b7280;font-weight:600">Required</th>
              <th style="text-align:left;padding:8px 12px;color:#6b7280;font-weight:600">Description</th>
            </tr>
          </thead>
          <tbody>
            ${ep.parameters
              .map(
                (p) => `
              <tr style="border-bottom:1px solid #111827">
                <td style="padding:8px 12px"><code style="color:#a5b4fc;font-family:monospace">${escape(p.name)}</code></td>
                <td style="padding:8px 12px;color:#9ca3af">${escape(p.location)}</td>
                <td style="padding:8px 12px"><code style="color:#94a3b8;font-family:monospace">${escape(p.type)}</code></td>
                <td style="padding:8px 12px;color:${p.required ? "#f87171" : "#6b7280"}">${p.required ? "Yes" : "No"}</td>
                <td style="padding:8px 12px;color:#9ca3af">${escape(p.description || "—")}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`
          : ""
      }
      ${
        ep.examples?.length
          ? ep.examples
              .map(
                (ex) => `
        <div style="margin-top:16px">
          <div style="font-size:11px;color:#6b7280;font-weight:600;margin-bottom:6px">${escape(ex.title)}${ex.statusCode ? ` — ${escape(String(ex.statusCode))}` : ""} <span style="color:#4b5563">[${escape(ex.type)}]</span></div>
          <pre style="background:#0a0f1a;border:1px solid #1e293b;border-radius:8px;padding:14px;overflow-x:auto;font-size:12px;color:#94a3b8;font-family:monospace;line-height:1.6">${escape(ex.code)}</pre>
        </div>`
              )
              .join("")
          : ""
      }
    </section>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escape(name)} — API Documentation</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060609; color: #d1d5db; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; min-height: 100vh; }
    .sidebar { width: 260px; min-height: 100vh; background: #0c0c12; border-right: 1px solid #1e293b; position: sticky; top: 0; height: 100vh; overflow-y: auto; padding: 20px 12px; flex-shrink: 0; }
    .sidebar-title { font-size: 13px; font-weight: 700; color: #f1f5f9; padding: 0 8px 16px; border-bottom: 1px solid #1e293b; margin-bottom: 16px; }
    .main { flex: 1; padding: 40px 48px; max-width: 900px; }
    .main-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
    .main-subtitle { font-size: 13px; color: #6b7280; margin-bottom: 40px; }
    a { color: inherit; }
    a:hover { color: #a5b4fc; }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-title">${escape(name)}</div>
    ${sidebarHtml}
  </aside>
  <main class="main">
    <h1 class="main-title">${escape(name)}</h1>
    <p class="main-subtitle">API Reference — ${endpoints.length} endpoint${endpoints.length !== 1 ? "s" : ""}</p>
    ${mainHtml}
  </main>
</body>
</html>`;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function ProjectViewPage() {
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [lastFormat, setLastFormat] = useState("md");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProject(id);
      setProject(res.data);
      const endpoints = res.data.endpoints || [];
      // If navigated here from global search, jump to that endpoint
      const targetId = location.state?.activeEndpointId;
      const target = targetId ? endpoints.find((e) => e.id === targetId) : null;
      setActiveEndpoint(target || endpoints[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  /* ── Export handlers ── */
  const handleExportMD = async () => {
    try {
      const markdown = await exportMarkdown(id);
      downloadFile(markdown, `${project?.name || "api-docs"}.md`);
      toast.success("Markdown exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleExportHTML = () => {
    try {
      const html = generateHtml(project);
      downloadFile(html, "specforge-docs.html", "text/html");
      toast.success("HTML exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleExportPDF = () => {
    const projectName = project?.name || "API Documentation";

    const printStyle = document.createElement("style");
    printStyle.id = "__sf_print_style__";
    printStyle.setAttribute("media", "print");
    printStyle.textContent = `
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { background: white !important; color: black !important; }
        aside { display: none !important; }
        header { display: none !important; }
        [data-tab-nav] { display: none !important; }
        [data-try-it-panel] { display: none !important; }
        main { padding: 40px 60px !important; max-width: 100% !important; }
        .text-text-primary, .text-text-secondary, .text-text-muted,
        h1, h2, h3, h4, p, td, th, span, code { color: black !important; }
        pre, code { background: #f4f4f4 !important; color: #111 !important; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; }
        th { background: #f0f0f0 !important; }
        [style*="rgba"], [style*="rgb("] { background: transparent !important; border-color: #ccc !important; }
      }
    `;

    const printHeader = document.createElement("div");
    printHeader.id = "__sf_print_header__";
    printHeader.style.cssText = "display:none";
    printHeader.innerHTML = `<h1 style="font-size:22px;font-weight:700;color:black;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #333">${projectName} — API Reference</h1>`;

    const headerStyle = document.createElement("style");
    headerStyle.id = "__sf_print_header_style__";
    headerStyle.setAttribute("media", "print");
    headerStyle.textContent = `@media print { #__sf_print_header__ { display: block !important; } }`;

    document.head.appendChild(printStyle);
    document.head.appendChild(headerStyle);
    document.body.insertBefore(printHeader, document.body.firstChild);

    window.print();

    const cleanup = () => {
      document.getElementById("__sf_print_style__")?.remove();
      document.getElementById("__sf_print_header__")?.remove();
      document.getElementById("__sf_print_header_style__")?.remove();
    };

    window.addEventListener("afterprint", cleanup, { once: true });
    // Fallback for browsers without afterprint support
    setTimeout(cleanup, 5000);
  };

  const exportHandlers = { md: handleExportMD, html: handleExportHTML, pdf: handleExportPDF };
  const exportLabels = { md: "Export MD", html: "Export HTML", pdf: "Export PDF" };

  const handlePrimaryExport = () => exportHandlers[lastFormat]();

  const handleDropdownSelect = (fmt) => {
    setLastFormat(fmt);
    setDropdownOpen(false);
    exportHandlers[fmt]();
  };

  /* ── Shared button style helpers ── */
  const btnBase = {
    background: "rgba(36,36,51,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
  };
  const btnHover = {
    background: "rgba(46,46,64,0.9)",
    borderColor: "rgba(255,255,255,0.1)",
  };

  if (loading) return <LoadingState message="Loading project…" />;
  if (error) return <ErrorState message={error} onRetry={fetchProject} />;
  if (!project) return <ErrorState message="Project not found" />;

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <Sidebar
        endpoints={project.endpoints || []}
        activeId={activeEndpoint?.id}
        onSelect={setActiveEndpoint}
        projectName={project.name}
      />

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 border-b border-white/[0.05]"
          style={{
            background: "rgba(10,10,15,0.82)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
            <div className="w-10 lg:hidden" />

            <SearchBar
              projectId={id}
              onSelect={setActiveEndpoint}
              className="flex-1 max-w-md"
            />

            {/* ── Split export button ── */}
            <div ref={dropdownRef} className="relative shrink-0">
              <div
                className="flex items-center rounded-lg overflow-hidden"
                style={btnBase}
              >
                {/* Primary action */}
                <motion.button
                  onClick={handlePrimaryExport}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200"
                  onMouseEnter={(e) => Object.assign(e.currentTarget.parentElement.style, btnHover)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.parentElement.style, btnBase)}
                >
                  <Download size={14} className="text-text-muted" />
                  <span className="hidden sm:inline text-text-secondary">
                    {exportLabels[lastFormat]}
                  </span>
                </motion.button>

                {/* Divider */}
                <span
                  className="w-px self-stretch"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />

                {/* Chevron toggle */}
                <motion.button
                  onClick={() => setDropdownOpen((o) => !o)}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center px-2 py-2 text-xs transition-all duration-200"
                  aria-label="Export format options"
                >
                  <ChevronDown
                    size={13}
                    className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-1 w-36 rounded-md shadow-lg z-50"
                    style={{
                      background: "#1f2937",
                      border: "1px solid #374151",
                    }}
                  >
                    {(["md", "html", "pdf"]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => handleDropdownSelect(fmt)}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-200 hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md"
                      >
                        {exportLabels[fmt]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Endpoint content with animated transitions */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEndpoint?.id ?? "empty"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <EndpointPage endpoint={activeEndpoint} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
