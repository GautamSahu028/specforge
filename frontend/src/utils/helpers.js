import { clsx } from "clsx";

export const cn = (...args) => clsx(...args);

export const METHOD_COLORS = {
  GET: "method-get",
  POST: "method-post",
  PUT: "method-put",
  PATCH: "method-patch",
  DELETE: "method-delete",
};

export function methodBadgeClass(method) {
  return `method-badge ${METHOD_COLORS[method] || "bg-surface-3 text-text-secondary"}`;
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "General";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function downloadFile(content, filename, mimeType = "text/markdown") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
