"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";

import { ResearchInput } from "@/components/research-input";
import { ResearchWorkspace } from "@/components/research-workspace";
import { streamResearch } from "@/lib/sse";
import type { ResearchState, ActivityEntry, IterationRecord, Phase } from "@/lib/types";
import { nowTime } from "@/lib/utils";

function deriveActivity(prev: ResearchState | null, next: ResearchState): ActivityEntry[] {
  if (!prev) {
    return [{ id: 1, time: nowTime(), message: "Planning research questions…", kind: "info" }];
  }

  const entries: ActivityEntry[] = [];
  let idBase = Date.now();

  if (prev.currentStep !== "planning" && next.currentStep === "researching" && prev.research_questions?.length) {
    entries.push({
      id: idBase++,
      time: nowTime(),
      message: `Generated ${next.research_questions.length} research questions`,
      kind: "success",
    });
  }

  if (prev.currentStep !== "researching" && next.currentStep === "researching" && next.researchIterations > prev.researchIterations) {
    entries.push({
      id: idBase++,
      time: nowTime(),
      message: next.researchIterations === 1
        ? "Searching for relevant sources…"
        : `Starting research iteration ${next.researchIterations}…`,
      kind: "info",
    });
  }

  if (prev.sources.length < next.sources.length) {
    entries.push({
      id: idBase++,
      time: nowTime(),
      message: `Found ${next.sources.length - prev.sources.length} sources`,
      kind: "success",
    });
  }

  if (prev.currentStep !== "analyzing" && next.currentStep === "analyzing") {
    entries.push({ id: idBase++, time: nowTime(), message: "Analyzing evidence…", kind: "info" });
  }

  if (prev.currentStep !== "evaluating" && next.currentStep === "evaluating") {
    entries.push({ id: idBase++, time: nowTime(), message: "Evaluating research coverage…", kind: "info" });
  }

  if (prev.needsMoreResearch !== next.needsMoreResearch) {
    if (next.needsMoreResearch) {
      entries.push({
        id: idBase++,
        time: nowTime(),
        message: "Additional research required",
        kind: "loop",
      });
    } else if (prev.needsMoreResearch) {
      entries.push({
        id: idBase++,
        time: nowTime(),
        message: "Evidence sufficient — writing report",
        kind: "success",
      });
    }
  }

  if (prev.currentStep !== "writing" && next.currentStep === "writing") {
    entries.push({ id: idBase++, time: nowTime(), message: "Writing final report…", kind: "info" });
  }

  if (!prev.report && next.report) {
    entries.push({ id: idBase++, time: nowTime(), message: "Research complete", kind: "success" });
  }

  if (prev.errors.length < next.errors.length) {
    next.errors.slice(prev.errors.length).forEach((err) => {
      entries.push({ id: idBase++, time: nowTime(), message: err, kind: "error" });
    });
  }

  return entries;
}

function recordIteration(
  prev: IterationRecord[],
  state: ResearchState,
): IterationRecord | null {
  const last = prev.at(-1);
  if (last?.index === state.researchIterations) return null;

  if (state.needsMoreResearch && !last?.decision) {
    return {
      index: state.researchIterations,
      decision: "more_research",
      critique: state.critique,
      steps: state.completedSteps.filter((s) => s !== "writing"),
      sources: state.sources.length,
      evidence: state.evidence.length,
    };
  }

  if (!state.needsMoreResearch && state.currentStep === "writing" && !last?.decision) {
    return {
      index: state.researchIterations,
      decision: "sufficient",
      critique: state.critique,
      steps: state.completedSteps.filter((s) => s !== "writing"),
      sources: state.sources.length,
      evidence: state.evidence.length,
    };
  }

  if (state.currentStep === "completed" && !last?.decision) {
    return {
      index: state.researchIterations,
      decision: "sufficient",
      critique: state.critique,
      steps: state.completedSteps.filter((s) => s !== "writing"),
      sources: state.sources.length,
      evidence: state.evidence.length,
    };
  }

  return null;
}

export function TraceIQApp() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [state, setState] = useState<ResearchState>({
    query: "",
    currentStep: "",
    completedSteps: [],
    researchIterations: 0,
    sources: [],
    evidence: [],
    critique: "",
    needsMoreResearch: false,
    report: "",
    errors: [],
    research_questions: [],
  });
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [iterations, setIterations] = useState<IterationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [maxIterations, setMaxIterations] = useState(2);
  const streamRef = useRef<{ abort: () => void } | null>(null);
  const prevStateRef = useRef<ResearchState | null>(null);

  const startResearch = useCallback(
    (query: string) => {
      setError(null);
      setPhase("running");
      const initial: ResearchState = {
        query,
        currentStep: "planning",
        completedSteps: [],
        researchIterations: 0,
        sources: [],
        evidence: [],
        critique: "",
        needsMoreResearch: false,
        report: "",
        errors: [],
        research_questions: [],
      };
      setState(initial);
      prevStateRef.current = null;
      setActivity([]);
      setIterations([]);

      streamRef.current = streamResearch(
        { query, maxIterations },
        {
          onState: (newState) => {
            const activityDiff = deriveActivity(prevStateRef.current, newState);
            if (activityDiff.length) {
              setActivity((a) => [...a, ...activityDiff.map((e, i) => ({ ...e, id: Date.now() + i }))]);
            }

            const iterationRecord = recordIteration(iterations, newState);
            if (iterationRecord) {
              setIterations((i) => [...i, iterationRecord]);
            }

            setState(newState);
            prevStateRef.current = newState;
          },
          onDone: (finalState) => {
            setState(finalState);
            setPhase("completed");
            streamRef.current = null;
          },
          onError: (message) => {
            setError(message);
            setPhase("failed");
            streamRef.current = null;
          },
        },
      );
    },
    [maxIterations, iterations],
  );

  const newResearch = useCallback(() => {
    if (streamRef.current) streamRef.current.abort();
    streamRef.current = null;
    setPhase("idle");
    setState({
      query: "",
      currentStep: "",
      completedSteps: [],
      researchIterations: 0,
      sources: [],
      evidence: [],
      critique: "",
      needsMoreResearch: false,
      report: "",
      errors: [],
      research_questions: [],
    });
    prevStateRef.current = null;
    setActivity([]);
    setIterations([]);
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (state.query) startResearch(state.query);
  }, [state.query, startResearch]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.abort();
    };
  }, []);

  if (phase === "idle") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <ResearchInput
            onStart={startResearch}
            disabled={false}
            maxIterations={maxIterations}
            onMaxIterationsChange={setMaxIterations}
          />
          <div className="mt-10 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              No data leaves this browser — the API URL is configurable via <code className="rounded bg-muted px-1.5 py-0.5 font-mono">NEXT_PUBLIC_API_URL</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResearchWorkspace
      state={state}
      phase={phase}
      activity={activity}
      iterations={iterations}
      error={error}
      onNewResearch={newResearch}
      onRetry={retry}
    />
  );
}