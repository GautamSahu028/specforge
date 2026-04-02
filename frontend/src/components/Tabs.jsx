import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/helpers";

export default function Tabs({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div>
      {/* ── Tab bar ── */}
      <div
        data-tab-nav
        className="flex gap-0.5 overflow-x-auto mb-1 p-1 rounded-xl"
        style={{
          background: "rgba(18,18,26,0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium whitespace-nowrap rounded-lg transition-colors duration-200",
                isActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {/* Animated pill background */}
              {isActive && (
                <motion.div
                  layoutId="tab-active-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "rgba(36,36,51,0.9)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              <span className="relative z-10">{tab.label}</span>

              {tab.count != null && tab.count > 0 && (
                <span
                  className={cn(
                    "relative z-10 text-2xs px-1.5 py-0.5 rounded-full font-medium transition-colors",
                    isActive
                      ? "bg-accent/15 text-accent-light"
                      : "bg-surface-3 text-text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content with animated transitions ── */}
      <div className="pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
