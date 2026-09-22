"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { Evidence } from "@/lib/types";
import { EvidenceCard } from "@/components/evidence-card";
import { cn } from "@/lib/utils";

export function EvidenceList({
  evidence,
  className,
}: { evidence: Evidence[]; className?: string }) {
  const [open, setOpen] = useState(evidence.length <= 6);

  return (
    <section className={cn("flex flex-col", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Evidence</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{evidence.length}</span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </span>
      </button>

      {open && (
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {evidence.length === 0 ? (
            <p className="col-span-full text-center py-4 text-xs text-muted-foreground/60">No evidence extracted yet.</p>
          ) : (
            evidence.map((item, index) => (
              <EvidenceCard key={`${item.source_url}-${index}`} evidence={item} index={index} />
            ))
          )}
        </div>
      )}
    </section>
  );
}