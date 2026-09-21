/**
 * Central product configuration.
 *
 * Change the brand name, domain, or pricing here — nothing else in the
 * app should hard-code these values.
 */

export const siteConfig = {
  productName: "AI SEO Page Optimizer",
  shortName: "SEO Optimizer",
  tagline: "Optimize Your Pages for Google & AI Search",
  description:
    "Analyze any webpage for SEO, content quality, structured data, and AI search readiness — then get clear, actionable recommendations.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportEmail: "support@example.com",
  twitterHandle: "@example",
  locale: "en-US",
  currency: "USD",
} as const;

export const navConfig = {
  main: [
    { label: "Features", href: "/features" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "/blog" },
  ],
  footer: {
    Product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "How It Works", href: "/how-it-works" },
    ],
    "SEO & AI Search": [
      { label: "SEO Page Audit", href: "/seo-page-audit" },
      { label: "AI Search Optimization", href: "/ai-search-optimization" },
      { label: "Product Page Optimizer", href: "/product-page-optimizer" },
      { label: "Heading Analyzer", href: "/heading-analyzer" },
      { label: "Schema Analyzer", href: "/schema-analyzer" },
    ],
    Company: [
      { label: "Blog", href: "/blog" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
} as const;

export type PlanId = "free" | "starter" | "professional" | "agency";

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: number | null; // null = "Free"
  priceLabel: string;
  cadence: string;
  description: string;
  ctaLabel: string;
  highlighted?: boolean;
  features: string[];
}

/**
 * Placeholder pricing. These are initial product hypotheses, not
 * validated market pricing. Edit freely — every page reads from here.
 */
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    cadence: "forever",
    description: "Try a full single-page audit, no account required.",
    ctaLabel: "Analyze a Page",
    features: [
      "3 analyses per day",
      "Single URL analysis",
      "Core technical SEO audit",
      "Heading structure analysis",
      "Basic AI Search readiness score",
      "Top priority recommendations",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    priceLabel: "$19",
    cadence: "/month",
    description: "For solo site owners who optimize pages regularly.",
    ctaLabel: "Start with Starter",
    features: [
      "100 analyses per month",
      "Full AI Search readiness report",
      "Content gap analysis",
      "Schema recommendations",
      "Downloadable PDF reports",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 49,
    priceLabel: "$49",
    cadence: "/month",
    description: "For SEO specialists and content marketers managing multiple sites.",
    ctaLabel: "Start with Professional",
    highlighted: true,
    features: [
      "500 analyses per month",
      "Product-page SEO mode",
      "Local business SEO mode",
      "Saved projects & audit history",
      "Structured data (JSON-LD) generator",
      "Priority support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 99,
    priceLabel: "$99",
    cadence: "/month",
    description: "For agencies auditing pages across many client accounts.",
    ctaLabel: "Start with Agency",
    features: [
      "2,000 analyses per month",
      "Team accounts (coming soon)",
      "White-label PDF reports (coming soon)",
      "API access (coming soon)",
      "Competitor comparison (coming soon)",
      "Dedicated support",
    ],
  },
];

export const freeplanLimits = {
  analysesPerDay: 3,
  maxHtmlBytes: 2_000_000, // 2 MB of raw HTML per fetch
  maxRedirects: 5,
  fetchTimeoutMs: 10_000,
} as const;
