import { Printer } from "lucide-react";
import type { AnalysisReport } from "@/src/types/analysis";
import { ScoreCard } from "@/components/results/ScoreCard";
import { PriorityFixes } from "@/components/results/PriorityFixes";
import { HeadingStructure } from "@/components/results/HeadingStructure";
import { ContentGaps } from "@/components/results/ContentGaps";
import { MetaSection } from "@/components/results/MetaSection";
import { AISection } from "@/components/results/AISection";
import { SchemaSection } from "@/components/results/SchemaSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/results/CopyButton";

const pageTypeLabels: Record<AnalysisReport["pageType"], string> = {
  product: "Product Page",
  article: "Article",
  service: "Service Page",
  local_business: "Local Business",
  general: "General Page",
};

function buildPlainTextReport(report: AnalysisReport): string {
  const lines: string[] = [];
  lines.push(`Page Optimization Report`);
  lines.push(`URL: ${report.finalUrl}`);
  lines.push(`Page type: ${pageTypeLabels[report.pageType]}`);
  lines.push(`Overall Page Optimization Score: ${report.scores.overall}/100`);
  lines.push(`AI Search Readiness: ${report.scores.aiSearchReadiness}/100`);
  lines.push("");
  lines.push("Top Priority Fixes:");
  report.topPriorityFixes.forEach((issue, i) => {
    lines.push(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title} — ${issue.recommendation}`);
  });
  return lines.join("\n");
}

export function ResultsDashboard({ report }: { report: AnalysisReport }) {
  return (
    <div id="results" className="mx-auto max-w-content px-6 py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="break-all text-sm text-ink/50">{report.finalUrl}</p>
          <h2 className="mt-1 font-display text-2xl text-ink">{report.pageTitle || "Untitled page"}</h2>
          <span className="mt-2 inline-block rounded-full border border-line px-2.5 py-0.5 text-xs text-ink/60">
            {pageTypeLabels[report.pageType]}
          </span>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={14} /> Download PDF Report
          </Button>
          <CopyButton text={buildPlainTextReport(report)} label="Copy Report" />
        </div>
      </div>

      {/* Score cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <ScoreCard label="Page Optimization Score" score={report.scores.overall} emphasized />
        <ScoreCard label="AI Search Readiness" score={report.scores.aiSearchReadiness} />
        <ScoreCard label="Technical SEO" score={report.scores.technicalSeo} />
        <ScoreCard label="Content Coverage" score={report.scores.contentCoverage} />
        <ScoreCard label="Structured Data" score={report.scores.structuredData} />
        <ScoreCard label="Heading Structure" score={report.scores.headingStructure} />
      </div>

      {/* Top priority fixes */}
      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Top Priority Fixes</h2>
        <p className="mt-1 text-sm text-ink/55">The highest-impact changes to make first.</p>
        <div className="mt-5">
          <PriorityFixes issues={report.topPriorityFixes} />
        </div>
      </section>

      {/* Heading structure */}
      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Heading Structure</h2>
        <div className="mt-5">
          <HeadingStructure current={report.heading.current} recommended={report.heading.recommendedOutline} />
        </div>
      </section>

      {/* Meta */}
      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Title &amp; Meta</h2>
        <div className="mt-5">
          <MetaSection meta={report.meta} />
        </div>
      </section>

      {/* Content gaps */}
      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Content Gaps</h2>
        <div className="mt-5">
          <ContentGaps questions={report.aiSearch.questions} contentGaps={report.content.contentGaps} />
        </div>
      </section>

      {/* AI Search */}
      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">AI Search Readiness</h2>
        <div className="mt-5">
          <AISection aiSearch={report.aiSearch} />
        </div>
      </section>

      {/* Schema */}
      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Structured Data</h2>
        <div className="mt-5">
          <SchemaSection schema={report.schema} />
        </div>
      </section>

      {/* Product / Local business data */}
      {report.productData && (
        <section className="mt-12">
          <h2 className="font-display text-xl text-ink">Product Details Detected</h2>
          <Card className="mt-5 grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            {Object.entries(report.productData)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs uppercase tracking-wide text-ink/40">{k}</p>
                  <p className="mt-1 text-sm text-ink">{String(v)}</p>
                </div>
              ))}
          </Card>
        </section>
      )}

      {report.localBusinessData && (
        <section className="mt-12">
          <h2 className="font-display text-xl text-ink">Local Business Details Detected</h2>
          <Card className="mt-5 grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            {Object.entries(report.localBusinessData)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs uppercase tracking-wide text-ink/40">{k}</p>
                  <p className="mt-1 text-sm text-ink">{String(v)}</p>
                </div>
              ))}
          </Card>
        </section>
      )}

      {/* Internal links, images, performance */}
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-ink">Internal Links</h3>
          <p className="mt-2 text-sm text-ink/70">
            {report.internalLinks.internalLinks} internal · {report.internalLinks.externalLinks} external
          </p>
          {report.internalLinks.genericAnchors > 0 && (
            <p className="mt-1 text-sm text-score-warn">{report.internalLinks.genericAnchors} generic anchor text link(s)</p>
          )}
          <p className="mt-3 text-xs text-ink/45">{report.internalLinks.note}</p>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-ink">Images</h3>
          <p className="mt-2 text-sm text-ink/70">{report.images.totalImages} image(s) found</p>
          {report.images.missingAlt > 0 && (
            <p className="mt-1 text-sm text-score-bad">{report.images.missingAlt} missing alt text</p>
          )}
          {report.images.genericAlt > 0 && (
            <p className="mt-1 text-sm text-score-warn">{report.images.genericAlt} generic alt text</p>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-ink">Performance</h3>
          <p className="mt-2 text-sm text-ink/70">Performance data not measured</p>
          <p className="mt-1 text-xs text-ink/45">{report.performance.note}</p>
        </Card>
      </section>

      <p className="mt-10 text-center text-xs text-ink/40">{report.singlePageModeNote}</p>
    </div>
  );
}
