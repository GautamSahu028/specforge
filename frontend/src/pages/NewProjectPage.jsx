import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Code, FileText, Loader2, Sparkles } from "lucide-react";
import { createProject, parseApi, generateDocs } from "../services/api";
import { cn } from "../utils/helpers";
import toast from "react-hot-toast";

const SOURCE_TYPES = [
  { key: "RAW_CODE", label: "API Code", icon: Code, hint: "Paste Express, FastAPI, or similar route code" },
  { key: "OPENAPI_SPEC", label: "OpenAPI Spec", icon: FileText, hint: "Paste JSON or YAML OpenAPI specification" },
];

const STEP_LABELS = ["Creating project...", "Parsing endpoints...", "Generating documentation..."];

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState("RAW_CODE");
  const [sourceCode, setSourceCode] = useState("");
  const [framework, setFramework] = useState("");
  const [step, setStep] = useState(-1); // -1 = idle
  const processing = step >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sourceCode.trim()) {
      toast.error("Name and source code are required");
      return;
    }

    try {
      // Step 1: Create project
      setStep(0);
      const projectRes = await createProject({
        name: name.trim(),
        source_type: sourceType,
        source_code: sourceCode.trim(),
        framework: framework.trim() || undefined,
      });
      const projectId = projectRes.data.id;

      // Step 2: Parse
      setStep(1);
      await parseApi(projectId);

      // Step 3: Generate docs
      setStep(2);
      await generateDocs(projectId);

      toast.success("Documentation generated!");
      navigate(`/projects/${projectId}`);
    } catch (err) {
      toast.error(err.message || "Failed to process API");
      setStep(-1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent-light rounded-full text-xs font-medium mb-4">
            <Sparkles size={12} />
            AI-Powered
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Generate API Docs</h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Paste your API code or OpenAPI spec and let AI generate comprehensive, developer-friendly documentation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project name */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My API"
              disabled={processing}
              className="w-full px-4 py-2.5 bg-surface-2 border border-surface-3 rounded-lg text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Source type toggle */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Input Type</label>
            <div className="grid grid-cols-2 gap-2">
              {SOURCE_TYPES.map(({ key, label, icon: Icon, hint }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSourceType(key)}
                  disabled={processing}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg border text-left transition-colors",
                    sourceType === key
                      ? "border-accent/50 bg-accent/5 text-accent-light"
                      : "border-surface-3 bg-surface-2 text-text-secondary hover:border-surface-4"
                  )}
                >
                  <Icon size={16} />
                  <div>
                    <span className="text-sm font-medium block">{label}</span>
                    <span className="text-2xs text-text-muted">{hint}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Framework (optional) */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Framework <span className="text-text-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="express, fastapi, flask..."
              disabled={processing}
              className="w-full px-4 py-2.5 bg-surface-2 border border-surface-3 rounded-lg text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Source code textarea */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Source Code / Spec</label>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder={
                sourceType === "RAW_CODE"
                  ? 'const router = express.Router();\n\nrouter.get("/users", async (req, res) => {\n  ...\n});'
                  : '{\n  "openapi": "3.0.0",\n  "paths": { ... }\n}'
              }
              rows={12}
              disabled={processing}
              className="w-full px-4 py-3 bg-surface-2 border border-surface-3 rounded-lg text-sm font-mono leading-relaxed focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 disabled:opacity-50 resize-y transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={processing || !name.trim() || !sourceCode.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-dim text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {STEP_LABELS[step] || "Processing..."}
              </>
            ) : (
              <>
                <Upload size={16} />
                Generate Documentation
              </>
            )}
          </button>

          {/* Progress steps */}
          {processing && (
            <div className="flex justify-center gap-6 pt-2">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      i < step ? "bg-mint" : i === step ? "bg-accent animate-pulse" : "bg-surface-4"
                    )}
                  />
                  <span className={cn("text-2xs", i <= step ? "text-text-secondary" : "text-text-muted")}>
                    {label.replace("...", "")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
