import { motion } from "framer-motion";
import MethodBadge from "./MethodBadge";
import CodeBlock from "./CodeBlock";
import Tabs from "./Tabs";

/* ─── Animation variants ─────────────────────────────────────────────────── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Parameters table ───────────────────────────────────────────────────── */
function ParamsTable({ parameters }) {
  if (!parameters || parameters.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-white/[0.05]">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-left border-b border-white/[0.05]"
            style={{ background: "rgba(18,18,26,0.6)" }}
          >
            <th className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
            <th className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-text-muted">In</th>
            <th className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-text-muted">Type</th>
            <th className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-text-muted">Req</th>
            <th className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-text-muted">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p) => (
            <tr
              key={p.id || p.name}
              className="border-b border-white/[0.04] transition-colors hover:bg-surface-2/40"
            >
              <td className="px-4 py-3 font-mono text-accent-light text-xs">{p.name}</td>
              <td className="px-4 py-3 text-xs text-text-muted">{p.location}</td>
              <td className="px-4 py-3 text-xs text-text-secondary font-mono">{p.type}</td>
              <td className="px-4 py-3">
                {p.required ? (
                  <span className="text-2xs font-medium text-coral bg-coral/10 ring-1 ring-coral/20 px-1.5 py-0.5 rounded-full">
                    Required
                  </span>
                ) : (
                  <span className="text-2xs text-text-muted">Optional</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-text-secondary">{p.description || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Examples section ───────────────────────────────────────────────────── */
function ExamplesSection({ examples, type }) {
  const filtered = examples.filter((e) => e.type === type);
  if (filtered.length === 0) {
    return (
      <p className="text-sm text-text-muted py-4">
        No {type.toLowerCase()} examples available.
      </p>
    );
  }
  return (
    <motion.div
      className="space-y-4"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {filtered.map((ex, i) => (
        <motion.div key={i} variants={fadeUp}>
          <CodeBlock
            code={ex.code}
            language={ex.language}
            title={`${ex.title}${ex.statusCode ? ` — ${ex.statusCode}` : ""}`}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function EndpointPage({ endpoint }) {
  if (!endpoint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent/50">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm text-text-muted">Select an endpoint from the sidebar</p>
      </div>
    );
  }

  const { method, path, summary, description, parameters = [], examples = [] } = endpoint;

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      content: (
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {description && (
            <motion.p
              variants={fadeUp}
              className="text-sm text-text-secondary leading-relaxed"
            >
              {description}
            </motion.p>
          )}
          <motion.div variants={fadeUp}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Parameters
            </h3>
            {parameters.length > 0 ? (
              <ParamsTable parameters={parameters} />
            ) : (
              <p className="text-sm text-text-muted">No parameters</p>
            )}
          </motion.div>
        </motion.div>
      ),
    },
    {
      key: "requests",
      label: "Request Examples",
      count: examples.filter((e) => e.type === "REQUEST").length,
      content: <ExamplesSection examples={examples} type="REQUEST" />,
    },
    {
      key: "responses",
      label: "Responses",
      count: examples.filter((e) => e.type === "RESPONSE").length,
      content: <ExamplesSection examples={examples} type="RESPONSE" />,
    },
    {
      key: "errors",
      label: "Errors",
      count: examples.filter((e) => e.type === "ERROR").length,
      content: <ExamplesSection examples={examples} type="ERROR" />,
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="mb-7">
        {/* Method + path */}
        <div
          className="flex items-center gap-3 mb-3 p-4 rounded-xl"
          style={{
            background: "rgba(18,18,26,0.6)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <MethodBadge method={method} />
          <h1 className="text-base sm:text-lg font-semibold font-mono text-text-primary truncate">
            {path}
          </h1>
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-text-secondary leading-relaxed pl-1">{summary}</p>
        )}
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={fadeUp}>
        <Tabs tabs={tabs} defaultTab="overview" />
      </motion.div>
    </motion.div>
  );
}
