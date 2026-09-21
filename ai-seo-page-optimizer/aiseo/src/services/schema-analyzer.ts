import type { ParsedPage, SchemaReport, PageType, Issue } from "@/src/types/analysis";

let issueCounter = 0;
function makeIssue(issue: Omit<Issue, "id">): Issue {
  issueCounter += 1;
  return { id: `schema-issue-${issueCounter}-${Date.now()}`, ...issue };
}

interface JsonLdObj {
  [key: string]: unknown;
}

function flattenNodes(page: ParsedPage): JsonLdObj[] {
  const nodes: JsonLdObj[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === "object") {
      nodes.push(value as JsonLdObj);
      const obj = value as JsonLdObj;
      if (Array.isArray(obj["@graph"])) (obj["@graph"] as unknown[]).forEach(visit);
    }
  };
  for (const block of page.jsonLd) {
    if (block.parsed) visit(block.parsed);
  }
  return nodes;
}

function nodeTypes(node: JsonLdObj): string[] {
  const t = node["@type"];
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x): x is string => typeof x === "string");
  return [];
}

function findByType(nodes: JsonLdObj[], type: string): JsonLdObj | undefined {
  return nodes.find((n) => nodeTypes(n).some((t) => t.toLowerCase() === type.toLowerCase()));
}

export interface SchemaAnalysisResult {
  schema: SchemaReport;
  issues: Issue[];
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
  localBusinessData?: { name?: string; address?: string; phone?: string; hours?: string };
}

export function analyzeSchema(page: ParsedPage, pageType: PageType): SchemaAnalysisResult {
  const issues: Issue[] = [];
  const nodes = flattenNodes(page);
  const hasAnyJsonLd = page.jsonLd.length > 0;
  const parseErrors = page.jsonLd.filter((b) => b.parseError).length;

  const allTypes = Array.from(new Set(nodes.flatMap(nodeTypes)));
  const detectedTypes: SchemaReport["detectedTypes"] = [];
  const recommendations: SchemaReport["recommendations"] = [];

  if (parseErrors > 0) {
    issues.push(
      makeIssue({
        severity: "medium",
        category: "structured_data",
        title: "Invalid JSON-LD found",
        whyItMatters: "Structured data that fails to parse is ignored by search engines and provides no benefit.",
        currentState: `${parseErrors} JSON-LD block(s) contain invalid JSON.`,
        recommendation: "Fix the JSON syntax in the affected <script type=\"application/ld+json\"> blocks.",
        impact: "medium",
        effort: "low",
      })
    );
  }

  for (const type of allTypes) {
    detectedTypes.push({ type, status: "ok" });
  }

  // Organization / WebSite are useful on essentially every page.
  if (!allTypes.some((t) => t.toLowerCase() === "organization")) {
    detectedTypes.push({ type: "Organization", status: "missing_related" });
    recommendations.push({
      title: "Add Organization schema",
      detail: "Organization schema helps establish the publisher/brand identity behind the page for search engines and AI systems.",
      suggestedJsonLd: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Your Company Name",
          url: page.canonical || page.url,
          logo: "https://example.com/logo.png",
        },
        null,
        2
      ),
    });
  }

  let productData: SchemaAnalysisResult["productData"];
  let localBusinessData: SchemaAnalysisResult["localBusinessData"];

  if (pageType === "product") {
    const productNode = findByType(nodes, "Product");
    if (!productNode) {
      detectedTypes.push({ type: "Product", status: "missing_related" });
      issues.push(
        makeIssue({
          severity: "high",
          category: "structured_data",
          title: "Missing Product structured data",
          whyItMatters:
            "Product schema helps search engines and AI shopping features understand price, availability, and identity of the product.",
          currentState: "This page appears to be a product page, but no Product schema was found.",
          recommendation: "Add Product schema with name, description, brand, and an Offer block.",
          impact: "high",
          effort: "medium",
        })
      );
      recommendations.push({
        title: "Add Product schema",
        detail: "Include name, description, brand, sku, and an Offer with price, priceCurrency, and availability.",
        suggestedJsonLd: JSON.stringify(
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Product name",
            description: "Concise, accurate product description.",
            brand: { "@type": "Brand", name: "Brand name" },
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: "0.00",
              availability: "https://schema.org/InStock",
            },
          },
          null,
          2
        ),
      });
    } else {
      const offerNode = (productNode["offers"] as JsonLdObj) || findByType(nodes, "Offer");
      const aggRating = (productNode["aggregateRating"] as JsonLdObj) || findByType(nodes, "AggregateRating");
      productData = {
        name: strOrUndef(productNode["name"]),
        brand: strOrUndef((productNode["brand"] as JsonLdObj)?.["name"]) || strOrUndef(productNode["brand"]),
        price: strOrUndef(offerNode?.["price"]),
        currency: strOrUndef(offerNode?.["priceCurrency"]),
        availability: strOrUndef(offerNode?.["availability"]),
        sku: strOrUndef(productNode["sku"]),
        ratingValue: strOrUndef(aggRating?.["ratingValue"]),
        reviewCount: strOrUndef(aggRating?.["reviewCount"]),
      };
      if (!offerNode) {
        issues.push(
          makeIssue({
            severity: "medium",
            category: "structured_data",
            title: "Product schema is missing an Offer",
            whyItMatters: "Without an Offer block, price and availability aren't machine-readable.",
            currentState: "Product schema found, but no offers/price data.",
            recommendation: "Add an Offer with price, priceCurrency, and availability.",
            impact: "medium",
            effort: "low",
          })
        );
      }
      if (!aggRating) {
        recommendations.push({
          title: "Consider adding AggregateRating",
          detail: "If this product has genuine customer reviews, AggregateRating schema can represent them accurately. Never fabricate ratings — only mark up real review data.",
        });
      }
    }
  }

  if (pageType === "local_business") {
    const lbNode = nodes.find((n) => nodeTypes(n).some((t) => t.toLowerCase().includes("localbusiness")));
    if (!lbNode) {
      detectedTypes.push({ type: "LocalBusiness", status: "missing_related" });
      issues.push(
        makeIssue({
          severity: "high",
          category: "structured_data",
          title: "Missing LocalBusiness structured data",
          whyItMatters: "LocalBusiness schema helps search engines display accurate business details such as hours, address, and phone number.",
          currentState: "This page appears to represent a local business, but no LocalBusiness schema was found.",
          recommendation: "Add LocalBusiness schema with name, address, telephone, and openingHours.",
          impact: "high",
          effort: "medium",
        })
      );
      recommendations.push({
        title: "Add LocalBusiness schema",
        detail: "Include name, address (as PostalAddress), telephone, and openingHoursSpecification.",
        suggestedJsonLd: JSON.stringify(
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Business name",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Main St",
              addressLocality: "City",
              addressRegion: "ST",
              postalCode: "00000",
              addressCountry: "US",
            },
            telephone: "+1-555-555-5555",
          },
          null,
          2
        ),
      });
    } else {
      localBusinessData = {
        name: strOrUndef(lbNode["name"]),
        address: formatAddress(lbNode["address"]),
        phone: strOrUndef(lbNode["telephone"]),
        hours: strOrUndef(lbNode["openingHours"]),
      };
    }
  }

  // BreadcrumbList — useful, generally not risky to recommend.
  if (!allTypes.some((t) => t.toLowerCase() === "breadcrumblist")) {
    recommendations.push({
      title: "Consider adding BreadcrumbList schema",
      detail: "Breadcrumb schema communicates the page's position in your site hierarchy.",
    });
  }

  // FAQPage note — deliberately does not claim a current Google rich-result benefit.
  const hasFaqSchema = allTypes.some((t) => t.toLowerCase() === "faqpage");
  if (hasFaqSchema) {
    recommendations.push({
      title: "FAQPage schema detected",
      detail:
        "Note: Google discontinued the FAQ rich-result feature in most search results in 2026, so FAQPage markup should not be added purely to try to earn that rich result. It can still be useful as a clear, machine-readable way to structure question-and-answer content for your own site and for AI systems that read structured data.",
    });
  }

  const score = computeSchemaScore(hasAnyJsonLd, parseErrors, issues);

  return {
    schema: {
      detectedTypes,
      hasAnyJsonLd,
      parseErrors,
      recommendations,
    },
    issues,
    productData,
    localBusinessData,
  };
}

function computeSchemaScore(hasAny: boolean, parseErrors: number, issues: Issue[]): number {
  let score = hasAny ? 70 : 30;
  if (parseErrors > 0) score -= 15;
  const severityPenalty = { critical: 30, high: 20, medium: 10, low: 4 } as const;
  for (const issue of issues) score -= severityPenalty[issue.severity];
  return Math.max(0, Math.min(100, score));
}

function strOrUndef(val: unknown): string | undefined {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  return undefined;
}

function formatAddress(address: unknown): string | undefined {
  if (!address || typeof address !== "object") return undefined;
  const a = address as JsonLdObj;
  const parts = [a["streetAddress"], a["addressLocality"], a["addressRegion"], a["postalCode"]]
    .filter((p): p is string => typeof p === "string");
  return parts.length > 0 ? parts.join(", ") : undefined;
}
