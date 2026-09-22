"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={cn("card-elevated animate-slide-up border-danger-border/50 bg-danger-soft/30 p-5")}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/15 text-danger shrink-0">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-danger">Research Interrupted</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    </div>
  );
}