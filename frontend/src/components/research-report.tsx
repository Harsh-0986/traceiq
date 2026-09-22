"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ResearchReport({
  report,
  writing,
  className,
}: { report: string; writing: boolean; className?: string }) {
  if (report.trim()) {
    return (
      <div className={cn("report animate-fade-in", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="group">
                {children}
              </a>
            ),
          }}
        >
          {report}
        </ReactMarkdown>
      </div>
    );
  }

  if (writing) {
    return (
      <div className={cn("flex flex-col gap-4", className)} aria-busy="true">
        <div className="flex items-center gap-3 animate-pulse-soft">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent animate-spin">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
          <span className="text-sm font-medium text-accent">Writing report…</span>
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-5 w-1/3 mt-6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  return (
    <div className={cn("card-elevated rounded-xl border-dashed border-border/50 p-8 text-center", className)}>
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <svg className="h-10 w-10 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p className="text-sm font-medium text-foreground">Report will appear here</p>
        <p className="text-xs">The Writer is composing the final report</p>
      </div>
    </div>
  );
}