import type {
  ParsedPage,
  Issue,
  TechnicalReport,
  HeadingReport,
  ImageReport,
  InternalLinkReport,
  HeadingNode,
} from "@/src/types/analysis";
import { clamp } from "@/src/lib/utils";

let issueCounter = 0;
function makeIssue(issue: Omit<Issue, "id">): Issue {
  issueCounter += 1;
  return { id: `issue-${issueCounter}-${Date.now()}`, ...issue };
}

export interface TechnicalAnalysisResult {
  technical: TechnicalReport;
  issues: Issue[];
}

export function analyzeTechnicalSeo(page: ParsedPage, finalUrl: string): TechnicalAnalysisResult {
  const issues: Issue[] = [];
  const checks: TechnicalReport["checks"] = [];
  let passed = 0;
  const totalChecks = 9;

  // Title
  const titleLen = page.title?.length ?? 0;
  if (!page.title) {
    issues.push(
      makeIssue({
        severity: "critical",
        category: "technical",
        title: "Missing page title",
        whyItMatters:
          "The <title> tag is one of the strongest on-page signals for both search engines and AI systems to understand what the page is about.",
        currentState: "No <title> tag was found.",
        recommendation:
          "Add a unique, descriptive title (roughly 50–60 characters) that clearly states the page's main topic.",
        impact: "high",
        effort: "low",
      })
    );
    checks.push({ label: "Title tag present", passed: false, detail: "No title tag found." });
  } else if (titleLen < 15 || titleLen > 65) {
    issues.push(
      makeIssue({
        severity: "medium",
        category: "technical",
        title: "Title length is outside the recommended range",
        whyItMatters:
          "Titles that are too short waste an opportunity to describe the page; titles that are too long are often truncated in search results.",
        currentState: `Current title is ${titleLen} characters: "${page.title}"`,
        recommendation: "Aim for roughly 50–60 characters that front-load the primary topic.",
        impact: "medium",
        effort: "low",
      })
    );
    checks.push({ label: "Title length", passed: false, detail: `${titleLen} characters (recommended ~50–60).` });
  } else {
    passed += 1;
    checks.push({ label: "Title length", passed: true, detail: `${titleLen} characters.` });
  }

  // Meta description
  const descLen = page.metaDescription?.length ?? 0;
  if (!page.metaDescription) {
    issues.push(
      makeIssue({
        severity: "high",
        category: "technical",
        title: "Missing meta description",
        whyItMatters:
          "The meta description often becomes the search-result snippet and gives both users and AI systems a concise summary of the page.",
        currentState: "No meta description was found.",
        recommendation:
          "Write a unique meta description (roughly 140–160 characters) that summarizes the page and includes its key topic.",
        impact: "medium",
        effort: "low",
      })
    );
    checks.push({ label: "Meta description present", passed: false, detail: "Not found." });
  } else if (descLen < 60 || descLen > 165) {
    issues.push(
      makeIssue({
        severity: "low",
        category: "technical",
        title: "Meta description length is outside the recommended range",
        whyItMatters: "Descriptions that are too short under-explain the page; overly long ones get truncated.",
        currentState: `Current meta description is ${descLen} characters.`,
        recommendation: "Aim for roughly 140–160 characters.",
        impact: "low",
        effort: "low",
      })
    );
    checks.push({ label: "Meta description length", passed: false, detail: `${descLen} characters.` });
  } else {
    passed += 1;
    checks.push({ label: "Meta description length", passed: true, detail: `${descLen} characters.` });
  }

  // Canonical
  if (!page.canonical) {
    issues.push(
      makeIssue({
        severity: "medium",
        category: "technical",
        title: "Missing canonical tag",
        whyItMatters:
          "A canonical tag tells search engines which URL is the authoritative version, which helps prevent duplicate-content issues.",
        currentState: "No <link rel=\"canonical\"> tag was found.",
        recommendation: "Add a self-referencing canonical tag pointing to the preferred URL for this page.",
        example: `<link rel="canonical" href="${finalUrl}" />`,
        impact: "medium",
        effort: "low",
      })
    );
    checks.push({ label: "Canonical tag present", passed: false, detail: "Not found." });
  } else {
    passed += 1;
    checks.push({ label: "Canonical tag present", passed: true, detail: page.canonical });
  }

  // Robots meta (indexability)
  const robotsBlocksIndexing = !!page.robotsMeta && /noindex/i.test(page.robotsMeta);
  if (robotsBlocksIndexing) {
    issues.push(
      makeIssue({
        severity: "critical",
        category: "technical",
        title: "Page is set to noindex",
        whyItMatters: "A noindex directive tells search engines not to include this page in results at all.",
        currentState: `Robots meta tag: "${page.robotsMeta}"`,
        recommendation: "Remove the noindex directive if you want this page to appear in search results.",
        impact: "high",
        effort: "low",
      })
    );
    checks.push({ label: "Indexable (no noindex)", passed: false, detail: page.robotsMeta ?? "" });
  } else {
    passed += 1;
    checks.push({ label: "Indexable (no noindex)", passed: true, detail: page.robotsMeta ?? "No robots meta tag (defaults to indexable)." });
  }

  // HTTPS
  const isHttps = finalUrl.startsWith("https://");
  if (!isHttps) {
    issues.push(
      makeIssue({
        severity: "high",
        category: "technical",
        title: "Page is not served over HTTPS",
        whyItMatters: "HTTPS is a baseline trust and security signal used by browsers and search engines.",
        currentState: "The final URL uses http:// rather than https://.",
        recommendation: "Serve the page over HTTPS with a valid TLS certificate.",
        impact: "medium",
        effort: "medium",
      })
    );
    checks.push({ label: "Served over HTTPS", passed: false, detail: finalUrl });
  } else {
    passed += 1;
    checks.push({ label: "Served over HTTPS", passed: true, detail: "Yes" });
  }

  // Viewport
  if (!page.viewport) {
    issues.push(
      makeIssue({
        severity: "medium",
        category: "technical",
        title: "Missing viewport meta tag",
        whyItMatters: "Without a viewport tag, mobile browsers may not render the page correctly, hurting mobile usability.",
        currentState: "No <meta name=\"viewport\"> tag was found.",
        recommendation: "Add a responsive viewport meta tag.",
        example: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
        impact: "medium",
        effort: "low",
      })
    );
    checks.push({ label: "Viewport meta tag present", passed: false, detail: "Not found." });
  } else {
    passed += 1;
    checks.push({ label: "Viewport meta tag present", passed: true, detail: page.viewport });
  }

  // Language
  if (!page.lang) {
    issues.push(
      makeIssue({
        severity: "low",
        category: "technical",
        title: "Missing HTML language attribute",
        whyItMatters: "The lang attribute helps search engines and assistive technology understand the page's language.",
        currentState: 'No lang attribute on the <html> tag.',
        recommendation: 'Add a lang attribute, e.g. <html lang="en">.',
        impact: "low",
        effort: "low",
      })
    );
    checks.push({ label: "HTML lang attribute present", passed: false, detail: "Not found." });
  } else {
    passed += 1;
    checks.push({ label: "HTML lang attribute present", passed: true, detail: page.lang });
  }

  // hreflang (only flagged as an opportunity, not required)
  checks.push({
    label: "hreflang tags",
    passed: page.hreflang.length > 0,
    detail: page.hreflang.length > 0 ? `${page.hreflang.length} alternate language link(s) found.` : "None found (only needed for multi-region/multi-language sites).",
  });
  if (page.hreflang.length > 0) passed += 1;

  // Open Graph (useful for sharing / some AI crawlers use it as metadata)
  const hasOg = Object.keys(page.openGraph).length > 0;
  checks.push({
    label: "Open Graph metadata",
    passed: hasOg,
    detail: hasOg ? `${Object.keys(page.openGraph).length} og: tags found.` : "No Open Graph tags found.",
  });
  if (hasOg) passed += 1;
  else {
    issues.push(
      makeIssue({
        severity: "low",
        category: "technical",
        title: "Missing Open Graph metadata",
        whyItMatters: "Open Graph tags control how the page appears when shared on social platforms and are read by some AI crawlers as structured metadata.",
        currentState: "No og: meta tags were found.",
        recommendation: "Add og:title, og:description, og:image, and og:url tags.",
        impact: "low",
        effort: "low",
      })
    );
  }

  const score = clamp(Math.round((passed / totalChecks) * 100), 0, 100);

  return { technical: { score, checks }, issues };
}

export interface HeadingAnalysisResult {
  heading: HeadingReport;
  issues: Issue[];
  score: number;
}

export function analyzeHeadings(page: ParsedPage, pageTitle: string | null): HeadingAnalysisResult {
  const issues: Issue[] = [];
  const h1s = page.headings.filter((h) => h.level === 1);

  if (h1s.length === 0) {
    issues.push(
      makeIssue({
        severity: "high",
        category: "heading",
        title: "Missing H1",
        whyItMatters: "The page lacks a clear primary heading that communicates its main topic to users and search engines.",
        currentState: "No H1 detected.",
        recommendation: "Add one descriptive H1 that clearly identifies the primary topic of the page.",
        impact: "high",
        effort: "low",
      })
    );
  } else if (h1s.length > 1) {
    issues.push(
      makeIssue({
        severity: "medium",
        category: "heading",
        title: "Multiple H1 tags",
        whyItMatters: "Multiple H1s can dilute the page's topical focus and make the primary subject less clear.",
        currentState: `${h1s.length} H1 tags found: ${h1s.map((h) => `"${h.text}"`).join(", ")}`,
        recommendation: "Use a single H1 for the page's main topic; convert additional H1s to H2s.",
        impact: "medium",
        effort: "low",
      })
    );
  } else {
    const len = h1s[0].text.length;
    if (len < 10 || len > 70) {
      issues.push(
        makeIssue({
          severity: "low",
          category: "heading",
          title: "H1 length may be suboptimal",
          whyItMatters: "A very short or very long H1 can be less useful for communicating the page topic clearly.",
          currentState: `H1: "${h1s[0].text}" (${len} characters)`,
          recommendation: "Aim for a clear, descriptive H1 of roughly 20–70 characters.",
          impact: "low",
          effort: "low",
        })
      );
    }
  }

  // Hierarchy checks: skipped levels, empty headings, duplicates.
  let previousLevel = 0;
  const seen = new Map<string, number>();
  for (const h of page.headings) {
    if (h.text.trim().length === 0) {
      issues.push(
        makeIssue({
          severity: "low",
          category: "heading",
          title: `Empty H${h.level} tag`,
          whyItMatters: "Empty headings provide no information and can confuse the document outline.",
          currentState: `An H${h.level} tag was found with no text content.`,
          recommendation: "Remove empty heading tags or add meaningful text.",
          impact: "low",
          effort: "low",
        })
      );
    }
    if (previousLevel > 0 && h.level - previousLevel > 1) {
      issues.push(
        makeIssue({
          severity: "low",
          category: "heading",
          title: "Skipped heading level",
          whyItMatters: "Jumping from H1 to H3 (or similar) breaks the logical document outline used by screen readers and search engines.",
          currentState: `An H${previousLevel} is followed directly by an H${h.level}.`,
          recommendation: "Use headings in sequential order (H1 → H2 → H3) without skipping levels.",
          impact: "low",
          effort: "low",
        })
      );
    }
    previousLevel = h.level;

    const key = h.text.trim().toLowerCase();
    if (key) seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    issues.push(
      makeIssue({
        severity: "low",
        category: "heading",
        title: "Duplicate heading text",
        whyItMatters: "Repeating the same heading text multiple times can make sections harder to distinguish.",
        currentState: `Repeated heading text: ${duplicates.map(([t]) => `"${t}"`).join(", ")}`,
        recommendation: "Make each heading unique and specific to the content that follows it.",
        impact: "low",
        effort: "low",
      })
    );
  }

  const h2Count = page.headings.filter((h) => h.level === 2).length;
  if (h2Count === 0 && page.wordCount > 300) {
    issues.push(
      makeIssue({
        severity: "medium",
        category: "heading",
        title: "No H2 subheadings on a substantial page",
        whyItMatters: "Subheadings break content into scannable sections, which helps both readers and AI systems extract specific answers.",
        currentState: `No H2 tags found on a page with ${page.wordCount} words.`,
        recommendation: "Break the content into logical sections, each introduced by a descriptive H2.",
        impact: "medium",
        effort: "medium",
      })
    );
  }

  const recommendedOutline = buildRecommendedOutline(page, pageTitle);

  // Score: start at 100, subtract for issues found, weighted by severity.
  const severityPenalty = { critical: 40, high: 25, medium: 12, low: 5 } as const;
  let score = 100;
  for (const issue of issues) score -= severityPenalty[issue.severity];
  score = clamp(score, 0, 100);

  return {
    heading: { current: page.headings, issues, recommendedOutline },
    issues,
    score,
  };
}

function buildRecommendedOutline(page: ParsedPage, pageTitle: string | null): HeadingNode[] {
  const h1s = page.headings.filter((h) => h.level === 1);
  const existingH2s = page.headings.filter((h) => h.level === 2).map((h) => h.text);

  const outline: HeadingNode[] = [];
  const h1Text = h1s[0]?.text || pageTitle || "Primary topic of the page";
  outline.push({ level: 1, text: h1Text });

  if (existingH2s.length > 0) {
    for (const text of existingH2s.slice(0, 6)) {
      outline.push({ level: 2, text });
    }
  } else {
    outline.push(
      { level: 2, text: "Overview" },
      { level: 2, text: "Key features / details" },
      { level: 2, text: "Frequently asked questions" }
    );
  }

  return outline;
}

export function analyzeImages(page: ParsedPage): { images: ImageReport } {
  const issues: Issue[] = [];
  const missingAlt = page.images.filter((img) => !img.hasAlt).length;
  const genericAlt = page.images.filter((img) => img.isGenericAlt).length;

  if (missingAlt > 0) {
    issues.push(
      makeIssue({
        severity: missingAlt > 3 ? "high" : "medium",
        category: "image",
        title: `${missingAlt} image${missingAlt === 1 ? "" : "s"} missing alt text`,
        whyItMatters: "Alt text helps search engines understand image content and is essential for screen-reader accessibility.",
        currentState: `${missingAlt} of ${page.images.length} images have no meaningful alt attribute.`,
        recommendation: "Add descriptive, natural-language alt text to every meaningful image.",
        impact: "medium",
        effort: "medium",
      })
    );
  }
  if (genericAlt > 0) {
    issues.push(
      makeIssue({
        severity: "low",
        category: "image",
        title: `${genericAlt} image${genericAlt === 1 ? "" : "s"} with generic alt text`,
        whyItMatters: "Generic alt text like \"image1\" provides no useful information about the image.",
        currentState: `${genericAlt} image(s) have filename-like or placeholder alt text.`,
        recommendation: "Replace generic alt text with a natural description of what the image shows.",
        impact: "low",
        effort: "low",
      })
    );
  }

  return {
    images: {
      totalImages: page.images.length,
      missingAlt,
      genericAlt,
      issues,
    },
  };
}

export function analyzeInternalLinks(page: ParsedPage): { internalLinks: InternalLinkReport; score: number } {
  const internal = page.links.filter((l) => l.isInternal);
  const external = page.links.filter((l) => !l.isInternal);
  const generic = page.links.filter((l) => l.isGenericAnchor);

  let score = 50;
  if (internal.length > 0) score += 30;
  if (internal.length >= 3) score += 10;
  if (generic.length > 0) score -= Math.min(30, generic.length * 5);
  score = clamp(score, 0, 100);

  return {
    internalLinks: {
      internalLinks: internal.length,
      externalLinks: external.length,
      genericAnchors: generic.length,
      note:
        "Single-page mode can evaluate existing internal links, but a full internal-link opportunity analysis requires crawling additional pages.",
    },
    score,
  };
}
