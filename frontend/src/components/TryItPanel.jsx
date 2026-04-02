import { useState } from "react";
import { ChevronRight, X, Copy, Check, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/helpers";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function extractPathParams(path) {
  return (path.match(/\{([^}]+)\}/g) || []).map((m) => m.slice(1, -1));
}

function getInitialBody(parameters, examples) {
  const req = (examples || []).find((e) => e.type === "REQUEST" && e.code);
  if (req) {
    try { return JSON.stringify(JSON.parse(req.code), null, 2); } catch {}
    const m = req.code.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (m) { try { return JSON.stringify(JSON.parse(m[0]), null, 2); } catch {} }
  }
  const bodyParams = (parameters || []).filter((p) => p.location === "body");
  if (!bodyParams.length) return "";
  const obj = {};
  bodyParams.forEach((p) => { obj[p.name] = ""; });
  return JSON.stringify(obj, null, 2);
}

const BODY_METHODS = ["POST", "PUT", "PATCH"];

const METHOD_COLORS = {
  GET:    { bg: "rgba(52,211,153,0.1)",  text: "#34d399", border: "rgba(52,211,153,0.2)"  },
  POST:   { bg: "rgba(99,102,241,0.12)", text: "#818cf8", border: "rgba(99,102,241,0.25)" },
  PUT:    { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24", border: "rgba(251,191,36,0.2)"  },
  PATCH:  { bg: "rgba(196,181,253,0.1)", text: "#c4b5fd", border: "rgba(196,181,253,0.2)" },
  DELETE: { bg: "rgba(251,113,133,0.1)", text: "#fb7185", border: "rgba(251,113,133,0.2)" },
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
      {children}
    </span>
  );
}

function CollapsibleSection({ label, defaultOpen = false, count, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-surface-2/40"
        style={{ background: "rgba(18,18,26,0.5)" }}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={13}
            className={cn(
              "text-text-muted transition-transform duration-200",
              open && "rotate-90"
            )}
          />
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          {count != null && (
            <span className="text-2xs px-1.5 py-0.5 rounded-full bg-surface-3 text-text-muted">
              {count}
            </span>
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3.5 py-3 border-t border-white/[0.04]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 text-2xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1 rounded"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {copied ? <Check size={11} className="text-mint" /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function TryItPanel({ endpoint }) {
  const { method, path, parameters = [], examples = [] } = endpoint;
  const upperMethod = method.toUpperCase();
  const isBodyMethod = BODY_METHODS.includes(upperMethod);
  const pathParams = extractPathParams(path);
  const mc = METHOD_COLORS[upperMethod] || METHOD_COLORS.GET;

  const [baseUrl, setBaseUrl] = useState("");
  const [pathParamValues, setPathParamValues] = useState(() =>
    Object.fromEntries(pathParams.map((p) => [p, ""]))
  );
  const [body, setBody] = useState(() =>
    isBodyMethod ? getInitialBody(parameters, examples) : ""
  );
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);

  const resolvedPath = path.replace(
    /\{([^}]+)\}/g,
    (_, p) => pathParamValues[p] || `{${p}}`
  );
  const updateHeader = (i, field, val) =>
    setHeaders((h) => h.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const handleSend = async () => {
    if (!baseUrl.trim()) return;
    setSending(true);
    setResponse(null);
    const start = Date.now();
    try {
      const reqHeaders = {};
      headers.forEach(({ key, value }) => { if (key.trim()) reqHeaders[key.trim()] = value; });
      const init = { method: upperMethod, headers: reqHeaders };
      if (isBodyMethod && body.trim()) init.body = body;
      const res = await fetch(baseUrl.trim() + resolvedPath, init);
      const time = Date.now() - start;
      const contentType = res.headers.get("content-type") || "";
      let responseBody;
      if (contentType.includes("application/json")) {
        responseBody = JSON.stringify(await res.json(), null, 2);
      } else {
        responseBody = await res.text();
      }
      const responseHeaders = {};
      res.headers.forEach((val, key) => { responseHeaders[key] = val; });
      setResponse({ status: res.status, statusText: res.statusText, time, body: responseBody, headers: responseHeaders, error: null });
    } catch (err) {
      setResponse({ error: err.message, attemptedUrl: baseUrl.trim() + resolvedPath });
    } finally {
      setSending(false);
    }
  };

  const statusColor = response?.status
    ? response.status >= 500
      ? { bg: "rgba(127,29,29,0.4)", border: "rgba(239,68,68,0.3)", text: "#f87171" }
      : response.status >= 400
      ? { bg: "rgba(120,53,15,0.4)", border: "rgba(234,179,8,0.3)", text: "#fbbf24" }
      : { bg: "rgba(20,83,45,0.4)", border: "rgba(34,197,94,0.3)", text: "#4ade80" }
    : null;

  const missingBaseUrl = !baseUrl.trim();

  return (
    <div data-try-it-panel className="space-y-4">

      {/* ── URL Bar ── */}
      <div
        className="flex items-center gap-0 rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(18,18,26,0.7)" }}
      >
        {/* Method badge */}
        <div
          className="flex items-center px-3.5 py-2.5 shrink-0 border-r"
          style={{
            background: mc.bg,
            borderColor: mc.border,
          }}
        >
          <span className="text-xs font-bold font-mono" style={{ color: mc.text }}>
            {upperMethod}
          </span>
        </div>

        {/* Base URL */}
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !missingBaseUrl && handleSend()}
          placeholder="https://your-api.com"
          className="flex-shrink-0 w-48 sm:w-56 bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none border-r border-white/[0.05] font-mono"
        />

        {/* Resolved path */}
        <div className="flex-1 px-3 py-2.5 text-sm font-mono text-text-muted truncate select-all">
          {resolvedPath}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || missingBaseUrl}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: sending || missingBaseUrl ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.9)",
            color: "#fff",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
          }}
          onMouseEnter={(e) => {
            if (!sending && !missingBaseUrl)
              e.currentTarget.style.background = "rgba(99,102,241,1)";
          }}
          onMouseLeave={(e) => {
            if (!sending && !missingBaseUrl)
              e.currentTarget.style.background = "rgba(99,102,241,0.9)";
          }}
        >
          {sending ? (
            <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-3.5 h-3.5" />
          ) : (
            <Send size={13} />
          )}
          <span className="hidden sm:inline">{sending ? "Sending…" : "Send"}</span>
        </button>
      </div>

      {missingBaseUrl && (
        <p className="text-2xs text-text-muted pl-1">
          Enter your API's base URL above, then hit Send.
        </p>
      )}

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Left: Request config ── */}
        <div className="space-y-3">

          {/* Path Parameters */}
          {pathParams.length > 0 && (
            <CollapsibleSection label="Path Parameters" count={pathParams.length} defaultOpen>
              <div className="space-y-2.5">
                {pathParams.map((param) => (
                  <div key={param}>
                    <label className="text-2xs text-text-muted mb-1 block font-mono">{`{${param}}`}</label>
                    <input
                      type="text"
                      placeholder={`Enter ${param}…`}
                      value={pathParamValues[param] ?? ""}
                      onChange={(e) =>
                        setPathParamValues((v) => ({ ...v, [param]: e.target.value }))
                      }
                      className="w-full bg-surface-2 text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none transition-colors placeholder-text-muted font-mono"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Request Body */}
          {isBodyMethod && (
            <CollapsibleSection label="Request Body" defaultOpen>
              <div className="relative">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  spellCheck={false}
                  className="font-mono w-full text-sm text-text-primary rounded-lg p-3 focus:outline-none resize-y transition-colors placeholder-text-muted"
                  style={{
                    background: "rgba(10,10,15,0.7)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                />
                <span className="absolute bottom-2.5 right-3 text-2xs text-text-muted pointer-events-none">
                  {body.length}B
                </span>
              </div>
            </CollapsibleSection>
          )}

          {/* Headers */}
          <CollapsibleSection label="Headers" count={headers.length}>
            <div className="space-y-2">
              {headers.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Header name"
                    value={row.key}
                    onChange={(e) => updateHeader(i, "key", e.target.value)}
                    className="flex-1 bg-surface-2 text-text-primary text-xs rounded-md px-2.5 py-1.5 focus:outline-none placeholder-text-muted transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => updateHeader(i, "value", e.target.value)}
                    className="flex-1 bg-surface-2 text-text-secondary text-xs rounded-md px-2.5 py-1.5 focus:outline-none placeholder-text-muted transition-colors font-mono"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  />
                  <button
                    onClick={() => setHeaders((h) => h.filter((_, idx) => idx !== i))}
                    className="text-text-muted hover:text-coral shrink-0 transition-colors p-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setHeaders((h) => [...h, { key: "", value: "" }])}
                className="text-xs text-accent-light hover:text-accent transition-colors mt-1"
              >
                + Add Header
              </button>
            </div>
          </CollapsibleSection>
        </div>

        {/* ── Right: Response ── */}
        <div
          className="rounded-xl overflow-hidden flex flex-col"
          style={{
            border: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(10,10,15,0.5)",
            minHeight: "260px",
          }}
        >
          <AnimatePresence mode="wait">
            {!response ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-1 gap-3 h-full py-16 text-text-muted"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                  <Send size={15} className="text-accent/50" />
                </div>
                <p className="text-sm">Response will appear here</p>
              </motion.div>
            ) : response.error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-3"
              >
                {/* Header */}
                <div
                  className="rounded-lg p-3.5"
                  style={{
                    background: "rgba(127,29,29,0.25)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <p className="text-sm font-semibold text-coral mb-1">Network Error — Failed to fetch</p>
                  <p className="text-xs text-text-muted font-mono break-all">
                    {upperMethod} {response.attemptedUrl}
                  </p>
                </div>

                {/* Diagnostic tips */}
                <div
                  className="rounded-lg p-3.5 space-y-2.5"
                  style={{
                    background: "rgba(18,18,26,0.6)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Things to check
                  </p>
                  {[
                    ["Wrong port or URL", "Make sure the port matches your running server, e.g. http://localhost:8000"],
                    ["Server not running", "Start your API server and confirm it's listening on that address"],
                    ["CORS not enabled", "Your server must return Access-Control-Allow-Origin headers for browser requests"],
                  ].map(([title, detail]) => (
                    <div key={title} className="flex gap-2.5">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-coral/50 shrink-0" />
                      <div>
                        <p className="text-xs text-text-secondary font-medium">{title}</p>
                        <p className="text-2xs text-text-muted mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1"
              >
                {/* Status bar */}
                <div
                  className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.04]"
                  style={{ background: "rgba(18,18,26,0.6)" }}
                >
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-md"
                    style={{
                      background: statusColor.bg,
                      border: `1px solid ${statusColor.border}`,
                      color: statusColor.text,
                    }}
                  >
                    {response.status} {response.statusText}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xs text-text-muted">{response.time}ms</span>
                    <CopyButton text={response.body} />
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-3.5 space-y-3">
                  <SectionLabel>Response Body</SectionLabel>
                  <textarea
                    readOnly
                    value={response.body}
                    rows={10}
                    className="font-mono w-full text-sm text-text-secondary rounded-lg p-3 resize-y focus:outline-none"
                    style={{
                      background: "rgba(6,6,9,0.6)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  />

                  {/* Response Headers */}
                  <CollapsibleSection
                    label="Response Headers"
                    count={Object.keys(response.headers).length}
                  >
                    <div className="space-y-1.5">
                      {Object.entries(response.headers).map(([k, v]) => (
                        <div key={k} className="flex gap-2 items-start">
                          <span className="text-2xs font-mono text-accent-light shrink-0 pt-0.5 w-36 truncate">{k}</span>
                          <span className="text-2xs font-mono text-text-muted break-all">{v}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
