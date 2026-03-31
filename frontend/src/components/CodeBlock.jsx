import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn, copyToClipboard } from "../utils/helpers";

export default function CodeBlock({ code, language, title, className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-lg border border-surface-3 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-surface-3">
        <div className="flex items-center gap-2">
          {language && (
            <span className="text-2xs font-mono uppercase tracking-wider text-text-muted">
              {language}
            </span>
          )}
          {title && (
            <span className="text-xs text-text-secondary">{title}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-mint" />
              <span className="text-mint">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed text-text-primary bg-surface-1">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
