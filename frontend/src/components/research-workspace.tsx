"use client";

import { useState } from "react";
import { FileText, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AgentActivity } from "@/components/agent-activity";
import { CompletionBanner } from "@/components/completion-banner";
import { CriticPanel } from "@/components/critic-panel";
import { ErrorBanner } from "@/components/error-banner";
import { EvidenceList } from "@/components/evidence-list";
import { IterationsList } from "@/components/iterations-list";
import { ResearchPipeline } from "@/components/research-pipeline";
import { ResearchReport } from "@/components/research-report";
import { SourceList } from "@/components/source-list";
import type { ResearchState, ActivityEntry, IterationRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  state: ResearchState;
  phase: "running" | "completed" | "failed";
  activity: ActivityEntry[];
  iterations: IterationRecord[];
  error: string | null;
  onNewResearch: () => void;
  onRetry: () => void;
};

export function ResearchWorkspace({
  state,
  phase,
  activity,
  iterations,
  error,
  onNewResearch,
  onRetry,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const running = phase === "running";
  const completed = phase === "completed";
  const writing = running && state.currentStep === "writing";

  const loopCount = Math.max(0, iterations.filter((i) => i.decision === "more_research").length);
  const completedSteps = state.completedSteps.filter((s) => s !== "writing");

  const sidebarContent = (
    <nav className="flex flex-col gap-5 pr-1 pb-6 pt-2">
      <ResearchPipeline
        currentStep={state.currentStep}
        completedSteps={completedSteps}
        running={running}
        loopCount={loopCount}
        completed={completed}
      />
      <Separator className="border-border/50" />
      <AgentActivity entries={activity} running={running} />
      <Separator className="border-border/50" />
      <IterationsList
        iterations={iterations}
        researchIterations={state.researchIterations}
        currentStep={state.currentStep}
        running={running}
      />
      <Separator className="border-border/50" />
      <SourceList sources={state.sources} defaultOpen={true} />
    </nav>
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/90 backdrop-blur-sm px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent font-semibold text-sm">
            T
          </div>
          <span className="font-medium tracking-tight">TraceIQ</span>
          <Badge
            variant={running ? "accent" : completed ? "done" : "danger"}
            className="font-mono text-[10px] uppercase tracking-wide"
          >
            {phase}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block font-mono text-[11px] text-muted-foreground max-w-[300px] truncate">
            {state.query}
          </span>
          <Button variant="ghost" size="sm" onClick={onNewResearch} className="gap-1.5">
            <FileText className="h-4 w-4" />
            New Research
          </Button>
        </div>
      </header>

      {error && (
        <div className="m-4 lg:m-6 animate-slide-up">
          <ErrorBanner message={error} onRetry={onRetry} />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 flex-shrink-0 border-r border-border/50 bg-card/50 hidden lg:block max-h-[calc(100vh-60px)] overflow-y-auto p-4 lg:p-5">
          {sidebarContent}
        </aside>

        <main className="flex-1 flex flex-col min-w-0 max-h-[calc(100vh-60px)] overflow-hidden p-4 lg:p-8">
          {phase === "completed" && (
            <div className="animate-slide-up mb-6">
              <CompletionBanner
                report={state.report}
                iterations={state.researchIterations}
                sourcesCount={state.sources.length}
                evidenceCount={state.evidence.length}
                onNewResearch={onNewResearch}
              />
            </div>
          )}

          <article className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full">
            <header className="mb-8 animate-slide-up">
              <p className="text-xl lg:text-2xl font-medium leading-7 text-foreground">{state.query}</p>
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </header>

            {state.critique && (
              <div className="mb-8 animate-slide-up">
                <CriticPanel
                  critique={state.critique}
                  needsMoreResearch={state.needsMoreResearch}
                />
              </div>
            )}

            {state.evidence.length > 0 && (
              <div className="mb-8 animate-slide-up">
                <EvidenceList evidence={state.evidence} />
              </div>
            )}

            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <ResearchReport report={state.report} writing={writing} />
            </div>
          </article>
        </main>

        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden animate-fade-in"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className={cn(
              "fixed inset-y-0 left-0 z-50 w-80 border-r border-border bg-card lg:hidden animate-slide-up",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur z-10 px-4 py-3 border-r border-border/50">
                <span className="font-medium">Pipeline & Activity</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(100%-60px)] overflow-y-auto pr-1 pb-6 pt-2">
                {sidebarContent}
              </div>
            </aside>
          </>
        )}

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden sticky bottom-0 z-20 mx-4 mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/80 backdrop-blur text-sm font-medium text-foreground"
        >
          <Search className="h-4 w-4" />
          Pipeline & Activity
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-mono text-[11px] text-muted-foreground">
            {activity.length}
          </span>
        </button>
      </div>
    </div>
  );
}