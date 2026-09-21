import type { Severity } from "@/src/config/scoring";

export type PageType = "product" | "article" | "service" | "local_business" | "general";

export interface HeadingNode {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ImageInfo {
  src: string;
  alt: string | null;
  hasAlt: boolean;
  isGenericAlt: boolean;
  width?: number | null;
  height?: number | null;
}

export interface LinkInfo {
  href: string;
  text: string;
  isInternal: boolean;
  isGenericAnchor: boolean;
}

export interface JsonLdBlock {
  raw: string;
  parsed: unknown | null;
  types: string[];
  parseError: boolean;
}

/** Output of the crawler service. */
export interface CrawlResult {
  finalUrl: string;
  status: number;
  html: string;
  fetchedAt: string;
  redirectCount: number;
  contentType: string | null;
  byteSize: number;
}

/** Output of the html-parser service. */
export interface ParsedPage {
  url: string;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  lang: string | null;
  viewport: string | null;
  hreflang: { lang: string; href: string }[];
  headings: HeadingNode[];
  paragraphs: string[];
  listItems: string[];
  images: ImageInfo[];
  links: LinkInfo[];
  jsonLd: JsonLdBlock[];
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  wordCount: number;
  visibleText: string;
}

export interface Issue {
  id: string;
  severity: Severity;
  category:
    | "technical"
    | "heading"
    | "content"
    | "structured_data"
    | "ai_search"
    | "internal_linking"
    | "image";
  title: string;
  whyItMatters: string;
  currentState: string;
  recommendation: string;
  example?: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
}

export interface QuestionCoverage {
  question: string;
  status: "covered" | "partial" | "missing";
  note: string;
}

export interface SchemaReport {
  detectedTypes: { type: string; status: "ok" | "incomplete" | "missing_related" }[];
  hasAnyJsonLd: boolean;
  parseErrors: number;
  recommendations: { title: string; detail: string; suggestedJsonLd?: string }[];
}

export interface HeadingReport {
  current: HeadingNode[];
  issues: Issue[];
  recommendedOutline: HeadingNode[];
}

export interface AiSearchReport {
  score: number;
  disclaimer: string;
  answerReadinessNote: string;
  questions: QuestionCoverage[];
  entityCoverage: { entity: string; covered: boolean }[];
  extractabilityNote: string;
  source: "heuristic" | "ai_enhanced";
}

export interface ContentReport {
  wordCount: number;
  score: number;
  contentGaps: string[];
  notes: string[];
}

export interface TechnicalReport {
  score: number;
  checks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
}

export interface InternalLinkReport {
  internalLinks: number;
  externalLinks: number;
  genericAnchors: number;
  note: string;
}

export interface ImageReport {
  totalImages: number;
  missingAlt: number;
  genericAlt: number;
  issues: Issue[];
}

export interface MetaSuggestion {
  currentTitle: string | null;
  recommendedTitle: string;
  currentDescription: string | null;
  recommendedDescription: string;
}

export interface ScoreBreakdown {
  overall: number;
  technicalSeo: number;
  contentCoverage: number;
  headingStructure: number;
  structuredData: number;
  aiSearchReadiness: number;
  internalLinking: number;
}

export interface AnalysisReport {
  url: string;
  finalUrl: string;
  pageTitle: string | null;
  pageType: PageType;
  analyzedAt: string;
  scores: ScoreBreakdown;
  technical: TechnicalReport;
  heading: HeadingReport;
  content: ContentReport;
  schema: SchemaReport;
  aiSearch: AiSearchReport;
  internalLinks: InternalLinkReport;
  images: ImageReport;
  meta: MetaSuggestion;
  topPriorityFixes: Issue[];
  allIssues: Issue[];
  performance: {
    measured: false;
    note: string;
  };
  productData?: {
    name?: string;
    brand?: string;
    price?: string;
    currency?: string;
    availability?: string;
    sku?: string;
    ratingValue?: string;
    reviewCount?: string;
  };
  localBusinessData?: {
    name?: string;
    address?: string;
    phone?: string;
    hours?: string;
  };
  singlePageModeNote: string;
  aiEnhanced: boolean;
}
