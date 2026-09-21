import { Check, CircleDashed, X } from "lucide-react";
import type { QuestionCoverage } from "@/src/types/analysis";
import { Card } from "@/components/ui/Card";

const statusConfig = {
  covered: { icon: Check, className: "text-score-good" },
  partial: { icon: CircleDashed, className: "text-score-warn" },
  missing: { icon: X, className: "text-score-bad" },
};

export function ContentGaps({
  questions,
  contentGaps,
}: {
  questions: QuestionCoverage[];
  contentGaps: string[];
}) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-ink">Questions your page should answer</h3>
      <ul className="mt-4 space-y-3">
        {questions.map((q, i) => {
          const { icon: Icon, className } = statusConfig[q.status];
          return (
            <li key={i} className="flex items-start gap-3 text-sm">
              <Icon size={16} className={`mt-0.5 shrink-0 ${className}`} />
              <div>
                <p className="text-ink">{q.question}</p>
                <p className="mt-0.5 text-xs text-ink/50">{q.note}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {contentGaps.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h4 className="text-sm font-medium text-ink">Recommended sections to add</h4>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/70">
            {contentGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
