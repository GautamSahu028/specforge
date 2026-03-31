import MethodBadge from "./MethodBadge";
import CodeBlock from "./CodeBlock";
import Tabs from "./Tabs";

function ParamsTable({ parameters }) {
  if (!parameters || parameters.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-3 text-left">
            <th className="pb-2 pr-4 font-medium text-text-muted text-xs uppercase tracking-wider">Name</th>
            <th className="pb-2 pr-4 font-medium text-text-muted text-xs uppercase tracking-wider">In</th>
            <th className="pb-2 pr-4 font-medium text-text-muted text-xs uppercase tracking-wider">Type</th>
            <th className="pb-2 pr-4 font-medium text-text-muted text-xs uppercase tracking-wider">Req</th>
            <th className="pb-2 font-medium text-text-muted text-xs uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p) => (
            <tr key={p.id || p.name} className="border-b border-surface-3/50">
              <td className="py-2.5 pr-4 font-mono text-accent-light text-xs">{p.name}</td>
              <td className="py-2.5 pr-4 text-xs text-text-muted">{p.location}</td>
              <td className="py-2.5 pr-4 text-xs text-text-secondary">{p.type}</td>
              <td className="py-2.5 pr-4">
                {p.required ? (
                  <span className="text-2xs font-medium text-coral bg-coral/10 px-1.5 py-0.5 rounded">Required</span>
                ) : (
                  <span className="text-2xs text-text-muted">Optional</span>
                )}
              </td>
              <td className="py-2.5 text-xs text-text-secondary">{p.description || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExamplesSection({ examples, type }) {
  const filtered = examples.filter((e) => e.type === type);
  if (filtered.length === 0) {
    return <p className="text-sm text-text-muted py-4">No {type.toLowerCase()} examples available.</p>;
  }
  return (
    <div className="space-y-4">
      {filtered.map((ex, i) => (
        <CodeBlock
          key={i}
          code={ex.code}
          language={ex.language}
          title={`${ex.title}${ex.statusCode ? ` — ${ex.statusCode}` : ""}`}
        />
      ))}
    </div>
  );
}

export default function EndpointPage({ endpoint }) {
  if (!endpoint) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        Select an endpoint from the sidebar
      </div>
    );
  }

  const { method, path, summary, description, parameters = [], examples = [] } = endpoint;

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {description && (
            <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
          )}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Parameters</h3>
            {parameters.length > 0 ? (
              <ParamsTable parameters={parameters} />
            ) : (
              <p className="text-sm text-text-muted">No parameters</p>
            )}
          </div>
        </div>
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MethodBadge method={method} />
          <h1 className="text-lg sm:text-xl font-semibold font-mono">{path}</h1>
        </div>
        {summary && <p className="text-sm text-text-secondary">{summary}</p>}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
