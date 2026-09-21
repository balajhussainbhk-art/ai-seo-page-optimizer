"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { UrlForm } from "@/components/analyzer/UrlForm";
import { LoadingProgress } from "@/components/analyzer/LoadingProgress";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { SampleAuditMockup } from "@/components/home/SampleAuditMockup";
import type { AnalysisReport } from "@/src/types/analysis";

type Status = "idle" | "loading" | "success" | "error";

export function AnalyzerApp() {
  const [status, setStatus] = useState<Status>("idle");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(url: string) {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setReport(data.report);
      setStatus("success");
    } catch {
      setError("The page took too long to respond. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success" && report) {
    return <ResultsDashboard report={report} />;
  }

  return (
    <div className="mx-auto max-w-content px-6">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div id="analyze" className="scroll-mt-24">
          <UrlForm onSubmit={handleAnalyze} disabled={status === "loading"} />

          {status === "error" && error && (
            <div className="mt-5 flex items-start gap-3 rounded-md border border-score-bad/30 bg-score-badBg p-4 text-sm text-score-bad">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {status === "loading" && (
            <div className="mt-8">
              <LoadingProgress done={false} />
            </div>
          )}

          <a
            href="#how-it-works"
            className="mt-6 inline-block text-sm text-ink/55 underline decoration-line underline-offset-4 hover:text-ink"
          >
            See How It Works
          </a>
        </div>

        <SampleAuditMockup />
      </div>
    </div>
  );
}
