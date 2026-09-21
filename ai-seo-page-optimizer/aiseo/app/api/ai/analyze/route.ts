import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/src/lib/validation/schemas";
import { crawlPage, CrawlError } from "@/src/services/crawler";
import { parseHtml } from "@/src/services/html-parser";
import { detectPageType } from "@/src/services/page-type-detector";
import { runAiAnalysis } from "@/src/services/ai-analyzer";
import { checkBurstLimit, clientKeyFromRequest } from "@/src/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Standalone endpoint for the AI-enhanced content/GEO analysis step.
 * Used internally by /api/analyze and available separately for future
 * "re-run AI analysis only" style features. Never exposes the AI API key
 * to the client — the key stays server-side in ai-analyzer.ts.
 */
export async function POST(req: Request) {
  const clientKey = clientKeyFromRequest(req);
  const burst = checkBurstLimit(clientKey, 5, 10_000);
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Please enter a valid public webpage URL." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Please enter a valid public webpage URL." },
      { status: 400 }
    );
  }

  try {
    const crawl = await crawlPage(parsed.data.url);
    const page = parseHtml(crawl.html, crawl.finalUrl);
    const pageType = detectPageType(page);
    const result = await runAiAnalysis(page, pageType);

    if (!result.available) {
      return NextResponse.json(
        {
          available: false,
          message: "AI-enhanced analysis is currently unavailable; results fall back to heuristic analysis.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ available: true, result: result.output });
  } catch (err) {
    if (err instanceof CrawlError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Something went wrong during AI analysis." }, { status: 500 });
  }
}
