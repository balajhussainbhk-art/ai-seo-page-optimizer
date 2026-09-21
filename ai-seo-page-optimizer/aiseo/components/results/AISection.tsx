import type { AiSearchReport } from "@/src/types/analysis";
import { Card } from "@/components/ui/Card";

export function AISection({ aiSearch }: { aiSearch: AiSearchReport }) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">AI Search Content Opportunities</h3>
        <span className="rounded bg-signal-light px-2 py-0.5 text-[11px] font-medium text-signal-dark">
          {aiSearch.source === "ai_enhanced" ? "AI-enhanced" : "Heuristic"}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink/60">{aiSearch.answerReadinessNote}</p>
      <p className="mt-1 text-sm text-ink/60">{aiSearch.extractabilityNote}</p>

      <div className="mt-5 divide-y divide-line border-t border-line">
        {aiSearch.questions.map((q, i) => (
          <div key={i} className="py-4">
            <p className="text-sm font-medium text-ink">{q.question}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">
              Current coverage: <span className="text-ink/70">{q.status}</span>
            </p>
            <p className="mt-1.5 text-sm text-ink/70">{q.note}</p>
          </div>
        ))}
      </div>

      {aiSearch.entityCoverage.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-xs uppercase tracking-wide text-ink/40">Entities identified on this page</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {aiSearch.entityCoverage.slice(0, 10).map((e, i) => (
              <span key={i} className="rounded-full border border-line px-2.5 py-1 text-xs text-ink/70">
                {e.entity}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 rounded bg-paper p-3 text-xs text-ink/50">
        {aiSearch.disclaimer} These recommendations are heuristic suggestions for improving clarity and
        answerability. They do not guarantee inclusion in AI-generated answers.
      </p>
    </Card>
  );
}
