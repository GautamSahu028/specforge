import { Loader2, AlertTriangle, FileQuestion, RefreshCw } from "lucide-react";

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <Loader2 size={28} className="animate-spin mb-3 text-accent" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertTriangle size={28} className="mb-3 text-coral" />
      <p className="text-sm text-text-secondary mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-surface-3 hover:bg-surface-4 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileQuestion size={28} className="mb-3 text-text-muted" />
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && <p className="text-xs text-text-muted mt-1 max-w-xs">{description}</p>}
    </div>
  );
}
