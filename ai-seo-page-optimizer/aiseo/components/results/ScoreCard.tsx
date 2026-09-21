import { cn, scoreBand } from "@/src/lib/utils";
import { Card } from "@/components/ui/Card";

const bandStyles = {
  good: "text-score-good bg-score-goodBg",
  warn: "text-score-warn bg-score-warnBg",
  bad: "text-score-bad bg-score-badBg",
};

export function ScoreCard({
  label,
  score,
  emphasized,
  footnote,
}: {
  label: string;
  score: number;
  emphasized?: boolean;
  footnote?: string;
}) {
  const band = scoreBand(score);
  return (
    <Card className={cn("p-5", emphasized && "border-ink/20 shadow-panel")}>
      <p className="text-sm text-ink/60">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("font-mono text-3xl font-medium tabular-nums", bandStyles[band].split(" ")[0])}>
          {score}
        </span>
        <span className="text-sm text-ink/40">/100</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className={cn("h-full rounded-full", band === "good" ? "bg-score-good" : band === "warn" ? "bg-score-warn" : "bg-score-bad")}
          style={{ width: `${score}%` }}
        />
      </div>
      {footnote && <p className="mt-2 text-xs text-ink/45">{footnote}</p>}
    </Card>
  );
}
