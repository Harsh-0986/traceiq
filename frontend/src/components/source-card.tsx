"use client";

import { ExternalLink } from "lucide-react";

import type { Source } from "@/lib/types";
import { cn, domainOf } from "@/lib/utils";

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const title = source.title.trim() || domainOf(source.url) || "Untitled source";
  const preview = source.content.trim();

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "card-elevated group flex flex-col gap-2.5 rounded-lg p-3.5 transition-all duration-200",
        "hover:border-accent-border/50 hover:shadow-md hover:bg-card",
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold leading-4 text-foreground group-hover:text-accent transition-colors">{title}</span>
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-accent transition-colors" />
      </div>
      {preview && <p className="line-clamp-2 text-xs leading-5 text-muted-foreground/80">{preview}</p>}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
        {source.question.trim() && (
          <span className="truncate font-mono text-[10px] text-muted-foreground/60 px-2 py-0.5 rounded bg-muted/50">
            {source.question}
          </span>
        )}
        <span className="font-mono text-[10px] text-muted-foreground/70">{domainOf(source.url)}</span>
      </div>
    </a>
  );
}