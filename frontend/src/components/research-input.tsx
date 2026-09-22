"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const EXAMPLE_QUERIES = [
  "How does PostgreSQL handle high-volume concurrent workloads?",
  "Next.js vs Remix for production apps",
  "How do open-source LLMs compare?",
  "AWS vs Azure vs Google Cloud",
];

export function ResearchInput({
  onStart,
  disabled,
  maxIterations,
  onMaxIterationsChange,
}: { onStart: (query: string) => void; disabled: boolean; maxIterations: number; onMaxIterationsChange: (n: number) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState("");

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (query.trim() && !disabled) onStart(query.trim());
      }
    },
    [query, disabled, onStart],
  );

  const handleSubmit = () => {
    if (query.trim() && !disabled) onStart(query.trim());
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl animate-fade-in">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-accent/30 bg-accent-soft">
          <span className="text-3xl font-bold tracking-tight text-accent">T</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">TraceIQ</h1>
        <p className="text-lg text-muted-foreground max-w-md">Evidence-driven deep research</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="w-full flex flex-col gap-5 animate-slide-up">
        <div className="flex flex-col gap-3">
          <Textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="What do you want to research?"
            rows={4}
            className="min-h-[130px] resize-y bg-card border-border/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/70">Max iterations</span>
              <select
                value={maxIterations}
                onChange={(e) => onMaxIterationsChange(Number(e.target.value))}
                disabled={disabled}
                className="rounded-lg border border-border/50 bg-card px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <Button type="button" size="lg" onClick={handleSubmit} disabled={disabled || !query.trim()} className="gap-2 h-12 px-6">
              {disabled ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Researching…
                </>
              ) : (
                <>
                  Start Research
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Try:</span>
          {EXAMPLE_QUERIES.map((q, i) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              disabled={disabled}
              className={cn(
                "underline underline-offset-2 hover:text-accent transition-colors px-1 rounded",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              {q}{i < EXAMPLE_QUERIES.length - 1 ? " ·" : ""}
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground/50">
          No data leaves this browser — API URL via <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">NEXT_PUBLIC_API_URL</code>
        </p>
      </form>
    </div>
  );
}