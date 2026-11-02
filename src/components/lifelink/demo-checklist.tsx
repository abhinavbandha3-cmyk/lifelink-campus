"use client";

import { CheckCircle2, Circle, GraduationCap, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEMO_STEPS, useDemoStore } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

/** Floating guided checklist shown while demo mode is active. */
export function DemoChecklist() {
  const { active, open, steps, dismiss, stop } = useDemoStore();
  const doneCount = DEMO_STEPS.filter((step) => steps[step.id]).length;

  if (!active || !open) return null;

  return (
    <aside
      aria-label="Demo mode checklist"
      className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-4 shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-stone-900">Demo mode</p>
            <p className="text-xs text-stone-500">
              {doneCount}/{DEMO_STEPS.length} steps done — data is reset to seed
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide demo checklist"
          className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <ol className="mt-3 space-y-2">
        {DEMO_STEPS.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm",
              steps[step.id] ? "text-emerald-800" : "text-stone-600"
            )}
          >
            {steps[step.id] ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" aria-hidden="true" />
            )}
            <span className={steps[step.id] ? "line-through opacity-70" : ""}>
              <span className="mr-1 font-semibold">{index + 1}.</span>
              {step.label}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            dismiss();
          }}
        >
          Hide
        </Button>
        <Button size="sm" variant="outline" onClick={stop}>
          Exit demo mode
        </Button>
      </div>
    </aside>
  );
}
