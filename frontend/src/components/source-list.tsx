"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { Source } from "@/lib/types";
import { SourceCard } from "@/components/source-card";
import { cn } from "@/lib/utils";

export function SourceList({
  sources,
  defaultOpen = true,
  className,
}: { sources: Source[]; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn("flex flex-col", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sources</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{sources.length}</span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2 animate-fade-in">
          {sources.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-3">No sources discovered yet.</p>
          ) : (
            sources.map((source, index) => (
              <SourceCard key={`${source.url}-${index}`} source={source} index={index} />
            ))
          )}
        </div>
      )}
    </section>
  );
}