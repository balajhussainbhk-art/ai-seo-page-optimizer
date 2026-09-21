import type { ParsedPage, PageType } from "@/src/types/analysis";

export function detectPageType(page: ParsedPage): PageType {
  const allTypes = page.jsonLd.flatMap((b) => b.types.map((t) => t.toLowerCase()));

  if (allTypes.some((t) => ["product"].includes(t))) return "product";
  if (allTypes.some((t) => ["localbusiness", "restaurant", "store"].some((k) => t.includes(k)))) {
    return "local_business";
  }
  if (allTypes.some((t) => ["article", "newsarticle", "blogposting"].includes(t))) return "article";
  if (allTypes.some((t) => t.includes("service"))) return "service";

  // Fallback heuristics when no useful JSON-LD is present.
  const text = page.visibleText.toLowerCase();
  const hasPriceSignal = /\$\s?\d+(\.\d{2})?/.test(text) || /add to cart|buy now|in stock/.test(text);
  if (hasPriceSignal) return "product";

  const hasAddressSignal = /\b(hours|open|monday|tuesday|directions)\b/.test(text) && /\bphone|call\b/.test(text);
  if (hasAddressSignal) return "local_business";

  const wordCount = page.wordCount;
  const hasArticleStructure = page.headings.filter((h) => h.level === 2).length >= 2 && wordCount > 400;
  if (hasArticleStructure) return "article";

  return "general";
}
