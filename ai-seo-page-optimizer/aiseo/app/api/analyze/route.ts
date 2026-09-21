import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/src/lib/validation/schemas";
import { generateReport } from "@/src/services/report-generator";
import { CrawlError } from "@/src/services/crawler";
import { checkBurstLimit, checkDailyLimit, clientKeyFromRequest } from "@/src/lib/security/rateLimit";
import { freeplanLimits } from "@/src/config/site";

// Requires Node.js runtime (dns lookups for SSRF protection, streaming fetch).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const clientKey = clientKeyFromRequest(req);

  const burst = checkBurstLimit(clientKey);
  if (!burst.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const daily = checkDailyLimit(clientKey, freeplanLimits.analysesPerDay);
  if (!daily.allowed) {
    return NextResponse.json(
      { error: "You've reached today's free analysis limit." },
      { status: 429 }
    );
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
    const report = await generateReport(parsed.data.url);
    return NextResponse.json({ report, remainingToday: daily.remaining });
  } catch (err) {
    if (err instanceof CrawlError) {
      const statusByCode: Record<CrawlError["code"], number> = {
        invalid_url: 400,
        unsafe: 400,
        blocked: 502,
        timeout: 504,
        too_large: 413,
        fetch_failed: 502,
      };
      return NextResponse.json({ error: err.message }, { status: statusByCode[err.code] });
    }
    // eslint-disable-next-line no-console
    console.error("[/api/analyze] unexpected error", err);
    return NextResponse.json(
      { error: "Something went wrong while analyzing this page. Please try again." },
      { status: 500 }
    );
  }
}
