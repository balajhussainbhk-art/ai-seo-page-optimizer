import type { Issue } from "@/src/types/analysis";
import { Card } from "@/components/ui/Card";
import { cn } from "@/src/lib/utils";

const severityStyles = {
  critical: "bg-score-badBg text-score-bad",
  high: "bg-score-badBg text-score-bad",
  medium: "bg-score-warnBg text-score-warn",
  low: "bg-line text-ink/60",
};

export function PriorityFixes({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <Card className="p-6 text-sm text-ink/60">
        No priority issues were found — nice work. See the full findings below for smaller opportunities.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue, i) => (
        <Card key={issue.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 font-mono text-sm text-ink/35">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium uppercase", severityStyles[issue.severity])}>
                    {issue.severity}
                  </span>
                  <h3 className="text-[15px] font-medium text-ink">{issue.title}</h3>
                </div>
                <p className="mt-1.5 text-sm text-ink/60">{issue.whyItMatters}</p>
                <p className="mt-2 text-sm text-ink">
                  <span className="font-medium">Fix: </span>
                  {issue.recommendation}
                </p>
                {issue.example && (
                  <pre className="mt-2 overflow-x-auto rounded bg-paper p-3 font-mono text-xs text-ink/70">
                    {issue.example}
                  </pre>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-4 text-xs text-ink/45">
              <span>Impact: <span className="font-medium text-ink/70">{issue.impact}</span></span>
              <span>Effort: <span className="font-medium text-ink/70">{issue.effort}</span></span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
