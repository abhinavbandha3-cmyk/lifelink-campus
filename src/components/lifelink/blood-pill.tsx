import { cn } from "@/lib/utils";

import { groupStyle } from "@/lib/constants";
import type { BloodGroup } from "@/lib/types";

export function BloodPill({
  group,
  variant = "solid",
  size = "md",
  className,
}: {
  group: BloodGroup;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hue = groupStyle(group);
  const negative = group.endsWith("-");
  return (
    <span
      data-testid={`pill-${group}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold tracking-tight",
        size === "sm" && "min-w-10 px-2 py-0.5 text-xs",
        size === "md" && "min-w-12 px-2.5 py-1 text-sm",
        size === "lg" && "min-w-16 px-3.5 py-1.5 text-base",
        variant === "solid"
          ? hue.solid
          : cn(hue.outline, "border-2 border-dashed"),
        className
      )}
      aria-label={`Blood group ${group}`}
    >
      {group.replace("-", "−")}
      {negative && <span className="sr-only"> (negative)</span>}
    </span>
  );
}
