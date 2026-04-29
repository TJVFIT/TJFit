"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ProgramDetailTabsProps = {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
};

export function ProgramDetailTabs({ tabs }: ProgramDetailTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const [height, setHeight] = useState<number | null>(null);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeId));

  useLayoutEffect(() => {
    const node = panelRefs.current[activeId];
    if (!node) return;
    setHeight(node.offsetHeight);
  }, [activeId, tabs]);

  useEffect(() => {
    const onResize = () => {
      const node = panelRefs.current[activeId];
      if (node) setHeight(node.offsetHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId]);

  if (!tabs.length) return null;

  return (
    <div>
      <div className="tj-nav-scroll flex max-w-full overflow-x-auto rounded-full border border-white/[0.07] bg-white/[0.035] p-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={cn(
              "relative min-h-[40px] shrink-0 rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.16em]",
              "transition-colors duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60",
              activeId === tab.id ? "text-[#071013]" : "text-white/48 hover:text-white"
            )}
          >
            {activeId === tab.id ? (
              <span
                className="absolute inset-0 rounded-full bg-cyan-300 transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                style={{ transform: `translateX(${index - activeIndex}00%)` }}
                aria-hidden
              />
            ) : null}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      <div
        className="relative mt-6 overflow-hidden transition-[height] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
        style={height ? { height } : undefined}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            ref={(node) => {
              panelRefs.current[tab.id] = node;
            }}
            aria-hidden={activeId !== tab.id}
            className={cn(
              "w-full transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
              activeId === tab.id
                ? "relative translate-y-0 opacity-100"
                : "pointer-events-none absolute inset-x-0 top-0 translate-y-2 opacity-0"
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
