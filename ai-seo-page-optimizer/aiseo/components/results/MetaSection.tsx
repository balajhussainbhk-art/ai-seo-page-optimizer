import type { MetaSuggestion } from "@/src/types/analysis";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/results/CopyButton";

export function MetaSection({ meta }: { meta: MetaSuggestion }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-ink">Title &amp; Meta Description</h3>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/40">Current title</p>
          <p className="mt-1.5 text-sm text-ink/70">{meta.currentTitle || <em>Not found</em>}</p>
          <div className="mt-3 flex items-start justify-between gap-2 rounded border border-line bg-paper p-3">
            <p className="text-sm text-ink">{meta.recommendedTitle}</p>
            <CopyButton text={meta.recommendedTitle} />
          </div>
          <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">Recommended title</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/40">Current meta description</p>
          <p className="mt-1.5 text-sm text-ink/70">{meta.currentDescription || <em>Not found</em>}</p>
          <div className="mt-3 flex items-start justify-between gap-2 rounded border border-line bg-paper p-3">
            <p className="text-sm text-ink">{meta.recommendedDescription}</p>
            <CopyButton text={meta.recommendedDescription} />
          </div>
          <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">Recommended meta description</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink/40">
        These are suggestions only — nothing on your live site is changed automatically.
      </p>
    </Card>
  );
}
