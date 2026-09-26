export type Source = {
  question: string;
  title: string;
  url?: string;
  content: string;
};

export type Evidence = {
  question: string;
  finding: string;
  confidence?: string;
  source_url?: string;
};

export type ResearchState = {
  query: string;
  currentStep: string;
  completedSteps: string[];
  researchIterations: number;
  sources: Source[];
  evidence: Evidence[];
  critique: string;
  needsMoreResearch: boolean;
  report: string;
  errors: string[];
  research_questions: string[];
};

export type StreamEvent =
  | ({ type: "state" } & Partial<ResearchState>)
  | { type: "done" };

export type ActivityKind = "info" | "success" | "loop" | "error";

export type ActivityEntry = {
  id: number;
  time: string;
  message: string;
  kind: ActivityKind;
};

export type IterationDecision = "more_research" | "sufficient";

export type IterationRecord = {
  index: number;
  decision: IterationDecision;
  critique: string;
  steps: string[];
  sources: number;
  evidence: number;
};

export type Phase = "idle" | "running" | "completed" | "failed";

export function emptyResearchState(): ResearchState {
  return {
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
  };
}

export function toResearchState(event: Partial<ResearchState> & Record<string, unknown>): ResearchState {
  return {
    query: (event.query as string) ?? "",
    currentStep: (event.current_step as string) ?? (event.currentStep as string) ?? "",
    completedSteps: (event.completed_steps as string[]) ?? (event.completedSteps as string[]) ?? [],
    researchIterations: (event.research_iterations as number) ?? (event.researchIterations as number) ?? 0,
    sources: (event.sources as Source[]) ?? [],
    evidence: (event.evidence as Evidence[]) ?? [],
    critique: (event.critique as string) ?? "",
    needsMoreResearch: (event.needs_more_research as boolean) ?? (event.needsMoreResearch as boolean) ?? false,
    report: (event.report as string) ?? "",
    errors: (event.errors as string[]) ?? [],
    research_questions: (event.research_questions as string[]) ?? [],
  };
}
