import { validateOutboundUrl, UnsafeUrlError } from "@/src/lib/security/ssrf";
import { freeplanLimits } from "@/src/config/site";
import type { CrawlResult } from "@/src/types/analysis";

export class CrawlError extends Error {
  code: "invalid_url" | "blocked" | "timeout" | "too_large" | "fetch_failed" | "unsafe";
  constructor(message: string, code: CrawlError["code"]) {
    super(message);
    this.name = "CrawlError";
    this.code = code;
  }
}

const USER_AGENT =
  "AISEOPageOptimizerBot/1.0 (+https://example.com/bot; page-audit tool, on-demand single fetch)";

/**
 * Fetches a single public page for analysis.
 *
 * Follows redirects manually (not via fetch's automatic follow) so every
 * hop can be re-validated against SSRF rules — a redirect to a private IP
 * must be blocked just like a direct request to one.
 */
export async function crawlPage(inputUrl: string): Promise<CrawlResult> {
  let currentUrl = inputUrl;
  let redirectCount = 0;

  while (redirectCount <= freeplanLimits.maxRedirects) {
    let validated;
    try {
      validated = await validateOutboundUrl(currentUrl);
    } catch (err) {
      if (err instanceof UnsafeUrlError) {
        throw new CrawlError(err.message, "unsafe");
      }
      throw new CrawlError("Please enter a valid public webpage URL.", "invalid_url");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), freeplanLimits.fetchTimeoutMs);

    let response: Response;
    try {
      response = await fetch(validated.url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        throw new CrawlError("The page took too long to respond. Please try again.", "timeout");
      }
      throw new CrawlError(
        "We couldn't access this page. The website may block automated requests.",
        "blocked"
      );
    }
    clearTimeout(timeout);

    // Manual redirect handling so each hop is re-validated.
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new CrawlError("This page redirected without a valid destination.", "blocked");
      }
      currentUrl = new URL(location, validated.url).toString();
      redirectCount += 1;
      continue;
    }

    if (response.status >= 400) {
      throw new CrawlError(
        "We couldn't access this page. The website may block automated requests or the page may not exist.",
        "blocked"
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("text/html") && !contentType.includes("xhtml")) {
      throw new CrawlError("This URL does not appear to be an HTML page.", "blocked");
    }

    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader && Number(contentLengthHeader) > freeplanLimits.maxHtmlBytes) {
      throw new CrawlError("This page is too large for the current analysis limit.", "too_large");
    }

    // Read the body with a hard byte cap even if content-length was absent/lied about.
    const reader = response.body?.getReader();
    if (!reader) {
      throw new CrawlError("We couldn't read a response from this page.", "fetch_failed");
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > freeplanLimits.maxHtmlBytes) {
          throw new CrawlError("This page is too large for the current analysis limit.", "too_large");
        }
        chunks.push(value);
      }
    }
    const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");

    return {
      finalUrl: validated.url.toString(),
      status: response.status,
      html,
      fetchedAt: new Date().toISOString(),
      redirectCount,
      contentType,
      byteSize: total,
    };
  }

  throw new CrawlError("This page redirected too many times.", "blocked");
}
