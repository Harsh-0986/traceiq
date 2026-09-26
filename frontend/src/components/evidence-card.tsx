"use client";

import { ExternalLink } from "lucide-react";

import type { Evidence } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn, domainOf } from "@/lib/utils";

function normalizeConfidence(value: string | undefined | null): "HIGH" | "MEDIUM" | "LOW" | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "high") return "HIGH";
  if (v === "medium") return "MEDIUM";
  if (v === "low") return "LOW";
  return null;
}

const CONFIDENCE_STYLE: Record<string, { variant: "done" | "loop" | "danger"; icon: string }> = {
  HIGH: { variant: "done", icon: "⬤" },
  MEDIUM: { variant: "loop", icon: "⬤" },
  LOW: { variant: "danger", icon: "⬤" },
};

export function EvidenceCard({ evidence, index }: { evidence: Evidence; index: number }) {
  const confidence = normalizeConfidence(evidence.confidence);
  const sourceUrl = evidence.source_url ?? "";
  const hasSource = Boolean(sourceUrl.trim());
  const confStyle = confidence ? CONFIDENCE_STYLE[confidence] : null;

  return (
    <div
      className={cn("card-elevated flex flex-col gap-2.5 rounded-lg p-4 transition-all duration-200", "hover:border-accent-border/50")}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      {evidence.question.trim() && (
        <span className="font-mono text-[10px] text-muted-foreground/60 px-2 py-0.5 rounded bg-muted/50 inline-block">
          {evidence.question}
        </span>
      )}
      <p className="text-sm leading-6 text-foreground/90">{evidence.finding}</p>
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
        {confidence && confStyle && (
          <Badge variant={confStyle.variant} className="gap-1.5 font-mono text-[10px]">
            {confStyle.icon} {confidence}
          </Badge>
        )}
        {hasSource && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70 hover:text-accent transition-colors"
          >
            {domainOf(sourceUrl)}
            <ExternalLink className="h-3 w-3 transition-colors group-hover:text-accent" />
          </a>
        )}
      </div>
    </div>
  );
}