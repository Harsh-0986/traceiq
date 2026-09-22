"use client";

import { useEffect, useRef } from "react";
import { CircleCheck, RotateCcw, TriangleAlert, CircleDot } from "lucide-react";

import type { ActivityEntry, ActivityKind } from "@/lib/types";
import { cn } from "@/lib/utils";

function KindIcon({ kind, className }: { kind: ActivityKind; className?: string }) {
  switch (kind) {
    case "info": return <CircleDot className={cn("h-3.5 w-3.5", className)} />;
    case "success": return <CircleCheck className={cn("h-3.5 w-3.5", className)} />;
    case "loop": return <RotateCcw className={cn("h-3.5 w-3.5", className)} />;
    case "error": return <TriangleAlert className={cn("h-3.5 w-3.5", className)} />;
  }
}

const KIND_COLOR: Record<ActivityKind, string> = {
  info: "text-muted-foreground",
  success: "text-accent",
  loop: "text-loop",
  error: "text-danger",
};

export function AgentActivity({ entries, running, className }: { entries: ActivityEntry[]; running: boolean; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Agent Activity</span>
        {running && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent animate-pulse-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live
          </span>
        )}
      </div>
      <div ref={scrollRef} aria-live="polite" className="max-h-72 overflow-y-auto pr-1 space-y-2.5">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center py-4">
            {running ? "Waiting for the first event…" : "No activity recorded yet."}
          </p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {entries.map((entry, i) => (
              <li key={entry.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground/50">{entry.time}</span>
                  <div className={cn("flex items-start gap-2 text-xs leading-5", KIND_COLOR[entry.kind])}>
                    <KindIcon kind={entry.kind} className="mt-0.5 shrink-0" />
                    <span className="text-foreground/90">{entry.message}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}