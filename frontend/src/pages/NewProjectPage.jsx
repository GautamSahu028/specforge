import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Code, FileText, Sparkles, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createProject, parseApi, generateDocs } from "../services/api";
import { cn } from "../utils/helpers";
import toast from "react-hot-toast";

/* ─── Config ─────────────────────────────────────────────────────────────── */
const SOURCE_TYPES = [
  {
    key: "RAW_CODE",
    label: "API Code",
    icon: Code,
    hint: "Express, FastAPI, or similar route code",
  },
  {
    key: "OPENAPI_SPEC",
    label: "OpenAPI Spec",
    icon: FileText,
    hint: "JSON or YAML OpenAPI specification",
  },
];

const STEPS = [
  {
    label: "Creating project",
    detail: "Initialising workspace and persisting configuration…",
  },
  {
    label: "Parsing endpoints",
    detail: "Extracting routes, parameters, and request shapes from your code…",
  },
  {
    label: "Generating docs",
    detail: "Running AI inference to produce structured, developer-friendly documentation…",
  },
];

/* ─── Animation variants ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.44, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ─── Processing overlay ─────────────────────────────────────────────────── */
function ProcessingOverlay({ step }) {
  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
      style={{
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Orbital spinner */}
      <div className="relative w-14 h-14 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-accent/20" />
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-accent-light animate-orbit"
          style={{ transformOrigin: "50% 50%" }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-accent/50 animate-orbit-reverse"
          style={{ transformOrigin: "50% 50%", animationDelay: "0.3s" }}
        />
        <div className="w-2 h-2 rounded-full bg-accent/30 animate-pulse" />
      </div>

      {/* Step label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="text-center px-6 mb-8"
        >
          <p className="text-sm font-semibold text-text-primary mb-1.5">
            {STEPS[step]?.label}…
          </p>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            {STEPS[step]?.detail}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Step dots */}
      <div className="flex items-center gap-5">
        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="relative flex items-center justify-center w-6 h-6">
              {i < step ? (
                <CheckCircle2 size={18} className="text-mint" />
              ) : i === step ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </>
              ) : (
                <div className="w-2 h-2 rounded-full bg-surface-4" />
              )}
            </div>
            <span
              className={cn(
                "text-2xs font-medium",
                i < step
                  ? "text-mint"
                  : i === step
                  ? "text-accent-light"
                  : "text-text-muted"
              )}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState("RAW_CODE");
  const [sourceCode, setSourceCode] = useState("");
  const [framework, setFramework] = useState("");
  const [step, setStep] = useState(-1);
  const processing = step >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sourceCode.trim()) {
      toast.error("Name and source code are required");
      return;
    }

    try {
      setStep(0);
      const projectRes = await createProject({
        name: name.trim(),
        source_type: sourceType,
        source_code: sourceCode.trim(),
        framework: framework.trim() || undefined,
      });
      const projectId = projectRes.data.id;

      setStep(1);
      await parseApi(projectId);

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-14">
      <div className="w-full max-w-2xl">

        {/* ── Back link ── */}
        <motion.button
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onClick={() => navigate("/home")}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors mb-8"
        >
          <ArrowLeft size={13} />
          All projects
        </motion.button>

        {/* ── Hero heading ── */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-5"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "#818cf8",
            }}
          >
            <Sparkles size={11} />
            AI-Powered Documentation
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mb-2">
            Generate API Docs
          </h1>
          <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
            Paste your API code or OpenAPI spec and let AI produce
            comprehensive, developer-friendly documentation instantly.
          </p>
        </motion.div>

        {/* ── Form card ── */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(18,18,26,0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
          }}
        >
          {/* Processing overlay */}
          <AnimatePresence>
            {processing && <ProcessingOverlay step={step} />}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

            {/* Project name */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My API"
                disabled={processing}
                className="input-glass"
              />
            </div>

            {/* Source type toggle */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Input Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SOURCE_TYPES.map(({ key, label, icon: Icon, hint }) => {
                  const active = sourceType === key;
                  return (
                    <motion.button
                      key={key}
                      type="button"
                      onClick={() => setSourceType(key)}
                      disabled={processing}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-3 rounded-lg border text-left transition-all duration-200",
                        active
                          ? "border-accent/40 text-accent-light"
                          : "border-surface-3 bg-surface-2/60 text-text-secondary hover:border-surface-4 hover:bg-surface-2"
                      )}
                      style={active ? {
                        background: "rgba(99,102,241,0.07)",
                        boxShadow: "0 0 0 1px rgba(99,102,241,0.15)",
                      } : {}}
                    >
                      <Icon size={15} className={active ? "text-accent-light" : "text-text-muted"} />
                      <div>
                        <span className="text-sm font-medium block">{label}</span>
                        <span className="text-2xs text-text-muted">{hint}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Framework (optional) */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Framework{" "}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="express, fastapi, flask…"
                disabled={processing}
                className="input-glass"
              />
            </div>

            {/* Source code textarea */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Source Code / Spec
              </label>
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
                className="input-glass font-mono leading-relaxed resize-y"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={processing || !name.trim() || !sourceCode.trim()}
              className="btn-primary w-full py-3"
              whileTap={{ scale: 0.98 }}
            >
              {processing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {STEPS[step]?.label || "Processing"}…
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Generate Documentation
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
