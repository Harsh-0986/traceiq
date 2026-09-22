"use client";

import { RotateCcw, Scale, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MISSING_MARKER = "Missing information:";

function parseCritique(critique: string): { body: string; missing: string } {
  const index = critique.lastIndexOf(MISSING_MARKER);
  if (index === -1) return { body: critique, missing: "" };
  return { body: critique.slice(0, index).trim(), missing: critique.slice(index + MISSING_MARKER.length).trim() };
}

function missingBullets(missing: string): string[] {
  if (!missing) return [];
  const normalized = missing.toLowerCase();
  if (normalized === "none" || normalized === "n/a") return [];
  const byLine = missing.split(/\n+/).map(l => l.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean);
  if (byLine.length > 1) return byLine;
  const single = byLine[0] ?? "";
  const byComma = single.split(/,\s*/).filter(Boolean);
  const looksLikeList = byComma.length >= 2 && byComma.every(p => p.trim().split(/\s+/).length <= 7);
  return looksLikeList ? byComma : [single];
}

export function CriticPanel({ critique, needsMoreResearch, className }: { critique: string; needsMoreResearch: boolean; className?: string }) {
  if (!critique.trim()) return null;
  const { body, missing } = parseCritique(critique);
  const bullets = missingBullets(missing);

  return (
    <Card className={cn("card-elevated animate-slide-up border-accent-border/50 bg-accent-soft/30", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold">Research Evaluation</CardTitle>
        </div>
        <CardDescription className="text-xs">The critic reviewed the collected evidence against your question.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">{body}</p>

        {bullets.length > 0 && (
          <div className="animate-fade-in">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Missing information</div>
            <ul className="flex flex-col gap-1.5">
              {bullets.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border/50 pt-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Decision</span>
          {needsMoreResearch ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-loop-border bg-loop-soft px-3 py-1 font-mono text-[10px] text-loop">
              <RotateCcw className="h-3 w-3" />
              Additional research required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-done-border bg-done-soft px-3 py-1 font-mono text-[10px] text-done">
              <ShieldCheck className="h-3 w-3" />
              Evidence sufficient — writing report
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}