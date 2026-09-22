"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CompletionBanner({
  report,
  iterations,
  sourcesCount,
  evidenceCount,
  onNewResearch,
}: { report: string; iterations: number; sourcesCount: number; evidenceCount: number; onNewResearch: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traceiq-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("card-elevated animate-slide-up border-done-border/50 bg-done-soft/30 p-5")}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-done/15 text-done">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-done">Research Complete</p>
            <p className="text-sm text-muted-foreground">
              {iterations} {iterations === 1 ? "iteration" : "iterations"} · {sourcesCount} sources · {evidenceCount} evidence items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCopy} aria-label="Copy report" className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} aria-label="Export Markdown" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export MD
          </Button>
          <Button variant="default" size="sm" onClick={onNewResearch} aria-label="Start new research" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            New Research
          </Button>
        </div>
      </div>
    </div>
  );
}