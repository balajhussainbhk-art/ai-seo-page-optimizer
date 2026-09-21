const demoScores = [
  { label: "Page Optimization", score: 68 },
  { label: "AI Search Readiness", score: 54 },
  { label: "Technical SEO", score: 82 },
  { label: "Structured Data", score: 41 },
];

const demoFindings = [
  { severity: "HIGH", text: "Missing Product structured data" },
  { severity: "MEDIUM", text: "H1 does not match page title" },
  { severity: "LOW", text: "3 images missing alt text" },
];

function band(score: number) {
  if (score >= 75) return "text-score-good";
  if (score >= 50) return "text-score-warn";
  return "text-score-bad";
}

export function SampleAuditMockup() {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <p className="text-xs text-ink/40">Sample audit</p>
          <p className="font-mono text-sm text-ink/70">example-store.com/product/organic-skin-care</p>
        </div>
        <span className="rounded bg-paper px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-ink/40">
          Demo
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {demoScores.map((s) => (
          <div key={s.label} className="rounded-md border border-line p-3">
            <p className="text-xs text-ink/50">{s.label}</p>
            <p className={`mt-1 font-mono text-2xl tabular-nums ${band(s.score)}`}>{s.score}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <p className="text-xs font-medium text-ink/50">Top findings</p>
        {demoFindings.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-medium text-ink/50">{f.severity}</span>
            <span className="text-ink/75">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
