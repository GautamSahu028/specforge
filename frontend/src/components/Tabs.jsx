import { useState } from "react";
import { cn } from "../utils/helpers";

export default function Tabs({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-surface-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative",
              active === tab.key
                ? "text-accent-light"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span className="ml-1.5 text-2xs bg-surface-3 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
            {active === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="pt-4">{activeTab?.content}</div>
    </div>
  );
}
