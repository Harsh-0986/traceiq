import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium leading-none tracking-wide transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-muted-foreground",
        accent: "border-accent-border bg-accent-soft text-accent",
        loop: "border-loop-border bg-loop-soft text-loop",
        done: "border-done-border bg-done-soft text-done",
        danger: "border-danger-border bg-danger-soft text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
