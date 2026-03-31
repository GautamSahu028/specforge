import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "../hooks/useAsync";
import { searchEndpoints } from "../services/api";
import MethodBadge from "./MethodBadge";
import { cn } from "../utils/helpers";

export default function SearchBar({ projectId, onSelect, className }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchEndpoints({ q: debouncedQuery, projectId, limit: 10 })
      .then((res) => {
        if (!cancelled) setResults(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery, projectId]);

  const handleSelect = (endpoint) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    onSelect?.(endpoint);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search endpoints..."
          className="w-full pl-9 pr-8 py-2 bg-surface-2 border border-surface-3 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-surface-2 border border-surface-3 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-text-muted">
              <Loader2 size={18} className="animate-spin mr-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((ep) => (
              <button
                key={ep.id}
                onClick={() => handleSelect(ep)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-3 transition-colors text-left"
              >
                <MethodBadge method={ep.method} />
                <span className="font-mono text-sm text-text-primary truncate">{ep.path}</span>
                {ep.summary && (
                  <span className="text-xs text-text-muted truncate ml-auto hidden sm:block">
                    {ep.summary}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-text-muted">
              No endpoints found
            </div>
          )}
        </div>
      )}

      {/* Click-away */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
