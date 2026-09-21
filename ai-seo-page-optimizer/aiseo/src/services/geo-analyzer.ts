import type { ParsedPage, AiSearchReport, PageType, QuestionCoverage } from "@/src/types/analysis";
import { clamp } from "@/src/lib/utils";

const DISCLAIMER =
  "This score is an internal optimization heuristic, not an official score from Google, ChatGPT, Gemini, or another search engine.";

function subjectFromPage(page: ParsedPage): string {
  const h1 = page.headings.find((h) => h.level === 1)?.text;
  return (h1 || page.title || "this page's topic").trim();
}

function questionTemplatesFor(pageType: PageType, subject: string): string[] {
  const base = [
    `What is ${subject}?`,
    `How does ${subject} work?`,
    `Who is ${subject} for?`,
  ];
  if (pageType === "product") {
    return [
      `What is the price of ${subject}?`,
      `Is ${subject} worth buying?`,
      `What are the features of ${subject}?`,
      `How does ${subject} compare with similar products?`,
      `Who is ${subject} suitable for?`,
      `Is ${subject} currently in stock?`,
    ];
  }
  if (pageType === "local_business") {
    return [
      `What are the hours for ${subject}?`,
      `Where is ${subject} located?`,
      `What services does ${subject} offer?`,
      `How can I contact ${subject}?`,
    ];
  }
  if (pageType === "article") {
    return [
      `What is ${subject} about?`,
      `Why does ${subject} matter?`,
      `What are the key takeaways of ${subject}?`,
      ...base.slice(1),
    ];
  }
  return base;
}

function textIncludesAny(text: string, needles: string[]): boolean {
  const lower = text.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

function coverageForQuestion(question: string, page: ParsedPage): QuestionCoverage {
  const text = page.visibleText;
  const q = question.toLowerCase();

  let status: QuestionCoverage["status"] = "missing";
  let note = "No clear section of the page directly addresses this question.";

  if (q.includes("price") || q.includes("cost")) {
    const hasPrice = /\$\s?\d/.test(text) || /price|cost/i.test(text);
    status = hasPrice ? "covered" : "missing";
    note = hasPrice
      ? "Pricing information appears to be present on the page."
      : "No clear pricing information was found in the visible text.";
  } else if (q.includes("hours")) {
    const hasHours = /\b(hours?|monday|tuesday|open|closed)\b/i.test(text);
    status = hasHours ? "covered" : "missing";
    note = hasHours ? "Business hours appear to be mentioned." : "No business hours were found.";
  } else if (q.includes("located") || q.includes("where")) {
    const hasAddress = /\b(street|ave|avenue|blvd|road|st\.|suite)\b/i.test(text);
    status = hasAddress ? "covered" : "partial";
    note = hasAddress ? "Address-like information appears to be present." : "Location information is unclear or missing.";
  } else if (q.includes("feature")) {
    const hasFeatures = page.listItems.length > 2 || /feature|spec|includes/i.test(text);
    status = hasFeatures ? "covered" : "partial";
    note = hasFeatures ? "Feature-like content or lists were found." : "Features are not clearly broken out.";
  } else if (q.includes("compare")) {
    const hasComparison = /\bvs\.?\b|compared to|versus|better than/i.test(text);
    status = hasComparison ? "partial" : "missing";
    note = hasComparison
      ? "The page touches on comparison, though a dedicated comparison section wasn't confirmed."
      : "No comparison information was found.";
  } else if (q.includes("stock") || q.includes("availab")) {
    const hasStock = /in stock|out of stock|available|availability/i.test(text);
    status = hasStock ? "covered" : "missing";
    note = hasStock ? "Availability information appears to be present." : "No availability information was found.";
  } else if (q.includes("suitable") || q.includes("who is") || q.includes("for?")) {
    status = "partial";
    note = "This is usually implied rather than clearly stated — consider a short 'who this is for' section.";
  } else if (q.startsWith("what is") || q.includes("about")) {
    status = page.wordCount > 100 ? "covered" : "partial";
    note = page.wordCount > 100 ? "The page provides a general description of the topic." : "The description of the topic is brief.";
  } else {
    // Generic fallback using headings as a proxy for topic coverage.
    const headingText = page.headings.map((h) => h.text).join(" ");
    const covered = textIncludesAny(headingText, keywordsFromQuestion(question));
    status = covered ? "partial" : "missing";
  }

  return { question, status, note };
}

function keywordsFromQuestion(question: string): string[] {
  return question
    .replace(/[?]/g, "")
    .split(" ")
    .filter((w) => w.length > 4);
}

export function analyzeAiSearchReadiness(page: ParsedPage, pageType: PageType): AiSearchReport {
  const subject = subjectFromPage(page);
  const questions = questionTemplatesFor(pageType, subject).map((q) => coverageForQuestion(q, page));

  const coveredCount = questions.filter((q) => q.status === "covered").length;
  const partialCount = questions.filter((q) => q.status === "partial").length;
  const coverageScore = questions.length > 0 ? (coveredCount + partialCount * 0.5) / questions.length : 0;

  // Extractability: short paragraphs, presence of lists, clear headings.
  const avgParaWords =
    page.paragraphs.length > 0
      ? page.paragraphs.reduce((a, p) => a + p.split(" ").length, 0) / page.paragraphs.length
      : 0;
  const hasLists = page.listItems.length > 0;
  const hasHeadings = page.headings.length >= 2;
  let extractabilityScore = 50;
  if (avgParaWords > 0 && avgParaWords < 90) extractabilityScore += 20;
  if (hasLists) extractabilityScore += 15;
  if (hasHeadings) extractabilityScore += 15;
  extractabilityScore = clamp(extractabilityScore, 0, 100);

  // Very rough entity coverage: capitalized multi-word phrases as a stand-in
  // for named entities (brand names, product names, places).
  const entityCandidates = Array.from(
    new Set(
      (page.visibleText.match(/\b([A-Z][a-zA-Z0-9]+(?:\s[A-Z][a-zA-Z0-9]+){0,2})\b/g) || []).filter(
        (e) => e.length > 2 && !/^(The|This|That|A|An)$/.test(e)
      )
    )
  ).slice(0, 8);
  const entityCoverage = entityCandidates.map((entity) => ({ entity, covered: true }));

  const score = clamp(Math.round(coverageScore * 60 + extractabilityScore * 0.4), 0, 100);

  return {
    score,
    disclaimer: DISCLAIMER,
    answerReadinessNote:
      coveredCount === questions.length
        ? "This page directly addresses most of the likely questions a user or AI system would have about this topic."
        : "This content structure may make important information easier for AI systems to interpret and extract, but some likely questions are only partially answered or not addressed.",
    questions,
    entityCoverage,
    extractabilityNote: hasLists
      ? "The page uses lists and headings, which tend to make specific facts easier to extract."
      : "Consider adding short, clearly structured sections or lists so specific facts are easier to extract.",
    source: "heuristic",
  };
}
