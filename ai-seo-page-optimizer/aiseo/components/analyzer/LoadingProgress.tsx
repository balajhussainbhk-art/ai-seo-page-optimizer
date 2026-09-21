"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

const STEPS = [
  "Fetching page",
  "Reading page structure",
  "Checking SEO signals",
  "Analyzing headings",
  "Checking structured data",
  "Evaluating AI Search readiness",
  "Preparing recommendations",
];

/**
 * The real work happens in one request/response, so we can't observe true
 * step-by-step completion from the server. To avoid falsely claiming a
 * step is done before the response returns, every step stays in "in
 * progress" until the request actually resolves, at which point `done`
 * flips all steps to complete at once rather than lying about timing.
 */
export function LoadingProgress({ done }: { done: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (done) {
      setActiveIndex(STEPS.length);
      return;
    }
    const interval = setInterval(() => {
      setActiveIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 900);
    return () => clearInterval(interval);
  }, [done]);

  return (
    <div className="mx-auto max-w-md rounded-lg border border-line bg-white p-6">
      <p className="mb-4 text-sm font-medium text-ink">Analyzing your page…</p>
      <ul className="space-y-3">
        {STEPS.map((step, i) => {
          const isComplete = i < activeIndex || done;
          const isCurrent = i === activeIndex && !done;
          return (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  isComplete ? "border-score-good bg-score-goodBg text-score-good" : "border-line text-ink/30"
                )}
              >
                {isComplete ? (
                  <Check size={12} strokeWidth={3} />
                ) : isCurrent ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : null}
              </span>
              <span className={isComplete ? "text-ink" : "text-ink/45"}>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
