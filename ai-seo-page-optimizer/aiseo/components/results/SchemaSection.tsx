import { Check, AlertTriangle } from "lucide-react";
import type { SchemaReport } from "@/src/types/analysis";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/results/CopyButton";

export function SchemaSection({ schema }: { schema: SchemaReport }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-ink">Structured Data (Schema.org)</h3>

      <ul className="mt-4 flex flex-wrap gap-2">
        {schema.detectedTypes.map((t, i) => (
          <li
            key={i}
            className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-ink/75"
          >
            {t.status === "ok" ? (
              <Check size={12} className="text-score-good" />
            ) : (
              <AlertTriangle size={12} className="text-score-warn" />
            )}
            {t.type}
          </li>
        ))}
        {schema.detectedTypes.length === 0 && (
          <li className="text-sm text-ink/50">No structured data types detected.</li>
        )}
      </ul>

      {schema.parseErrors > 0 && (
        <p className="mt-3 text-sm text-score-bad">
          {schema.parseErrors} JSON-LD block(s) could not be parsed as valid JSON.
        </p>
      )}

      {schema.recommendations.length > 0 && (
        <div className="mt-6 space-y-4 border-t border-line pt-5">
          <h4 className="text-sm font-medium text-ink">Recommended Schema Improvements</h4>
          {schema.recommendations.map((rec, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-ink">{rec.title}</p>
              <p className="mt-1 text-sm text-ink/60">{rec.detail}</p>
              {rec.suggestedJsonLd && (
                <div className="mt-2 rounded border border-line bg-paper p-3">
                  <div className="mb-1.5 flex justify-end">
                    <CopyButton text={rec.suggestedJsonLd} />
                  </div>
                  <pre className="overflow-x-auto font-mono text-xs text-ink/70">{rec.suggestedJsonLd}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-ink/40">
        Schema is checked for plausible structure, not submitted to Google for official validation.
      </p>
    </Card>
  );
}
