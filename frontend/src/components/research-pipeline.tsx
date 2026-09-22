"use client";

import {
  Circle,
  CircleDot,
  Check,
  ListChecks,
  Microscope,
  PenLine,
  RotateCcw,
  Scale,
  Search,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "active" | "completed";

export type PipelineStep = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: "planning", label: "Planning", hint: "Breaking the question into research questions", icon: ListChecks },
  { id: "researching", label: "Researching", hint: "Searching the web for relevant sources", icon: Search },
  { id: "analyzing", label: "Analyzing", hint: "Extracting evidence from sources", icon: Microscope },
  { id: "evaluating", label: "Evaluating", hint: "Deciding if the evidence is sufficient", icon: Scale },
  { id: "writing", label: "Writing", hint: "Composing the final report", icon: PenLine },
];

export function getStepStatus(
  stepId: string,
  currentStep: string,
  completedSteps: string[],
  running: boolean,
): StepStatus {
  if (completedSteps.includes(stepId)) return "completed";
  if (running && stepId === currentStep) return "active";
  return "pending";
}

type ResearchPipelineProps = {
  currentStep: string;
  completedSteps: string[];
  running: boolean;
  loopCount: number;
  completed: boolean;
  className?: string;
};

export function ResearchPipeline({
  currentStep,
  completedSteps,
  running,
  loopCount,
  completed,
  className,
}: ResearchPipelineProps) {
  const looping = loopCount > 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {PIPELINE_STEPS.map((step, index) => {
        const status = getStepStatus(step.id, currentStep, completedSteps, running);
        const isLast = index === PIPELINE_STEPS.length - 1;

        return (
          <div key={step.id} className="animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <StepMarker status={status} />
                {!isLast && (
                  <div
                    aria-hidden
                    className={cn(
                      "mt-1.5 w-px flex-1 min-h-4 transition-colors duration-300",
                      status === "completed" ? "bg-accent/40" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className={cn("pt-0.5 pb-5", isLast && "pb-0")}>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium leading-5 transition-colors",
                      status === "active" && "text-accent",
                      status === "completed" && "text-foreground",
                      status === "pending" && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.id === "researching" && running && loopCount > 0 && (
                    <span className="inline-flex items-center rounded-full border border-loop-border bg-loop-soft px-2 py-0.5 font-mono text-[10px] text-loop">
                      ×{loopCount + 1}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs leading-4 text-muted-foreground/70">
                  {status === "active" ? step.hint : status === "completed" ? "Completed" : "Pending"}
                </div>
              </div>
            </div>

            {step.id === "evaluating" && looping && (
              <div className="relative flex gap-4 ml-7 mt-2 animate-fade-in">
                <div className="flex flex-col items-center">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-loop-border bg-loop-soft text-loop">
                    <RotateCcw className="h-3 w-3" />
                  </span>
                  <div aria-hidden className="mt-1.5 w-px flex-1 min-h-4 bg-loop-border/50" />
                </div>
                <div className="pt-0.5 pb-5">
                  <span className="inline-flex items-center rounded-full border border-loop-border bg-loop-soft px-2.5 py-1 font-mono text-[10px] text-loop">
                    more research required
                  </span>
                  <div className="mt-1.5 text-xs text-muted-foreground/70">
                    The critic sent the agent back to Researching
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {completed && (
        <div className="relative mt-3 flex gap-3 border-t border-border pt-4 animate-slide-up">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-done text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <div className="pt-0.5 text-sm font-medium leading-5 text-done">Research Complete</div>
        </div>
      )}
    </div>
  );
}

function StepMarker({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white animate-scale-in">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="relative flex h-5 w-5 items-center justify-center animate-pulse-soft">
        <CircleDot className="h-5 w-5 text-accent" strokeWidth={2} />
        <Circle className="absolute h-7 w-7 border-2 border-accent/30 rounded-full animate-pulse-soft" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center text-border/50">
      <Circle className="h-[18px] w-[18px]" strokeWidth={1.5} />
    </span>
  );
}