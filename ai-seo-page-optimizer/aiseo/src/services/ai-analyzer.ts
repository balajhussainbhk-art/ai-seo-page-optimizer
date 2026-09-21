import { aiAnalysisSchema, type AiAnalysisOutput } from "@/src/lib/validation/schemas";
import type { ParsedPage, PageType } from "@/src/types/analysis";
import { truncate } from "@/src/lib/utils";

const MAX_INPUT_CHARS = 6000; // token-conscious cap on what we send to the model
const MODEL = process.env.AI_API_MODEL || "claude-sonnet-4-6";

export interface AiAnalyzerResult {
  available: boolean;
  output: AiAnalysisOutput | null;
  error?: string;
}

/**
 * Sends a compact, pre-extracted summary of the page (never raw HTML) to
 * the configured AI provider for a deeper content + AI-Search analysis.
 * Returns available: false whenever the API key is missing or the call
 * fails, so callers can fall back to heuristic-only analysis without
 * ever crashing the audit.
 */
export async function runAiAnalysis(page: ParsedPage, pageType: PageType): Promise<AiAnalyzerResult> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return { available: false, output: null, error: "AI_API_KEY not configured" };
  }

  const extractedSummary = buildExtractedSummary(page, pageType);

  const systemPrompt = `You are an SEO and AI-search (GEO) auditor. You will receive extracted signals from a single webpage (not raw HTML). Respond with ONLY a JSON object matching this exact shape, with no markdown fences and no commentary:
{
  "contentScore": number (0-100),
  "aiSearchScore": number (0-100),
  "questions": [{ "question": string, "status": "covered"|"partial"|"missing", "note": string }],
  "entities": [{ "entity": string, "covered": boolean }],
  "contentGaps": [string],
  "recommendations": [{ "title": string, "whyItMatters": string, "recommendation": string, "severity": "critical"|"high"|"medium"|"low" }]
}
Base every judgment strictly on the provided extracted signals. Do not claim the content was checked against live ChatGPT, Gemini, or Perplexity results — you are producing heuristic readiness guidance only. Never recommend keyword stuffing, hidden text, fake reviews, or guaranteed-ranking claims. Provide 3-6 questions, 3-8 entities, up to 5 content gaps, and up to 6 recommendations.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: extractedSummary }],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return { available: false, output: null, error: `AI provider returned ${response.status}` };
    }

    const data = await response.json();
    const textBlock = Array.isArray(data.content)
      ? data.content.find((b: { type: string }) => b.type === "text")
      : null;
    const rawText: string | undefined = textBlock?.text;
    if (!rawText) {
      return { available: false, output: null, error: "AI provider returned no text content" };
    }

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const validated = aiAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      return { available: false, output: null, error: "AI output failed validation" };
    }

    return { available: true, output: validated.data };
  } catch (err) {
    return {
      available: false,
      output: null,
      error: err instanceof Error ? err.message : "Unknown AI analyzer error",
    };
  }
}

function buildExtractedSummary(page: ParsedPage, pageType: PageType): string {
  const headings = page.headings.slice(0, 25).map((h) => `H${h.level}: ${h.text}`);
  const paragraphSample = truncate(page.paragraphs.slice(0, 12).join(" \n "), MAX_INPUT_CHARS);

  return JSON.stringify(
    {
      pageType,
      title: page.title,
      metaDescription: page.metaDescription,
      wordCount: page.wordCount,
      headings,
      listItemSample: page.listItems.slice(0, 15),
      paragraphSample,
      jsonLdTypes: page.jsonLd.flatMap((b) => b.types),
    },
    null,
    0
  ).slice(0, MAX_INPUT_CHARS);
}
