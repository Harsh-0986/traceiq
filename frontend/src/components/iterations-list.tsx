"use client";

import { Check, LoaderCircle, RotateCcw } from "lucide-react";

import type { IterationRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<string, string> = {
  planning: "Planning",
  researching: "Researching",
  analyzing: "Analyzing",
  evaluating: "Evaluating",
  writing: "Writing",
};

export function IterationsList({
  iterations,
  researchIterations,
  currentStep,
  running,
  className,
}: { iterations: IterationRecord[]; researchIterations: number; currentStep: string; running: boolean; className?: string }) {
  const lastDecided = iterations.at(-1)?.index ?? 0;
  const showLive = running && currentStep === "researching" && lastDecided < researchIterations + 1;

  if (iterations.length === 0 && !showLive) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-xs text-muted-foreground/60">No iterations yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Iterations</span>
        <span className="font-mono text-[11px] text-muted-foreground">{iterations.length} completed</span>
      </div>

      {iterations.map((record, i) => (
        <div key={record.index} className="card-elevated p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wide text-foreground">Iteration {record.index}</span>
            {record.decision === "more_research" ? (
              <Badge variant="loop"><RotateCcw className="h-3 w-3 mr-1" /> more research</Badge>
            ) : (
              <Badge variant="done"><Check className="h-3 w-3 mr-1" /> sufficient</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {record.steps.map((step) => (
              <span key={step} className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                <Check className="h-2.5 w-2.5 text-accent" strokeWidth={3} />
                {STEP_LABELS[step] ?? step}
              </span>
            ))}
          </div>
          <p className="text-xs leading-4 text-muted-foreground">
            {record.evidence} evidence · {record.sources} sources
          </p>
        </div>
      ))}

      {showLive && (
        <div className="card-elevated p-4 border-accent-border/50 animate-pulse-soft">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-accent">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              Iteration {researchIterations + 1}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">in progress</span>
          </div>
        </div>
      )}
    </div>
  );
}