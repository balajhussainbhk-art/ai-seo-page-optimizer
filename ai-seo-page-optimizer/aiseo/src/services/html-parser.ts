import * as cheerio from "cheerio";
import type {
  ParsedPage,
  HeadingNode,
  ImageInfo,
  LinkInfo,
  JsonLdBlock,
} from "@/src/types/analysis";

const GENERIC_ANCHORS = new Set([
  "click here",
  "here",
  "read more",
  "learn more",
  "more",
  "link",
  "this page",
  "this article",
]);

const GENERIC_ALT_PATTERNS = [/^image\d*$/i, /^img\d*$/i, /^photo\d*$/i, /^untitled/i, /^dsc_?\d+/i, /^\s*$/];

function isGenericAnchor(text: string): boolean {
  return GENERIC_ANCHORS.has(text.trim().toLowerCase());
}

function isGenericAlt(alt: string): boolean {
  return GENERIC_ALT_PATTERNS.some((re) => re.test(alt.trim()));
}

export function parseHtml(html: string, pageUrl: string): ParsedPage {
  const $ = cheerio.load(html);
  const origin = safeOrigin(pageUrl);

  // Remove non-visible/script content before computing visible text & word count.
  const $body = $("body").clone();
  $body.find("script, style, noscript, template").remove();
  const visibleText = collapseWhitespace($body.text());
  const wordCount = visibleText.length === 0 ? 0 : visibleText.split(/\s+/).filter(Boolean).length;

  const title = normalize($("title").first().text());
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || null;
  const robotsMeta = $('meta[name="robots"]').attr("content")?.trim() || null;
  const lang = $("html").attr("lang")?.trim() || null;
  const viewport = $('meta[name="viewport"]').attr("content")?.trim() || null;

  const hreflang: { lang: string; href: string }[] = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const langAttr = $(el).attr("hreflang");
    const href = $(el).attr("href");
    if (langAttr && href) hreflang.push({ lang: langAttr, href });
  });

  const headings: HeadingNode[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = Number(el.tagName.replace("h", "")) as HeadingNode["level"];
    const text = normalize($(el).text());
    headings.push({ level, text });
  });

  const paragraphs: string[] = [];
  $("p").each((_, el) => {
    const text = normalize($(el).text());
    if (text.length > 0) paragraphs.push(text);
  });

  const listItems: string[] = [];
  $("li").each((_, el) => {
    const text = normalize($(el).text());
    if (text.length > 0) listItems.push(text);
  });

  const images: ImageInfo[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (!src) return;
    const altAttrPresent = $(el).attr("alt") !== undefined;
    const alt = $(el).attr("alt") ?? null;
    const width = numOrNull($(el).attr("width"));
    const height = numOrNull($(el).attr("height"));
    images.push({
      src,
      alt,
      hasAlt: altAttrPresent && !!alt && alt.trim().length > 0,
      isGenericAlt: !!alt && isGenericAlt(alt),
      width,
      height,
    });
  });

  const links: LinkInfo[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const text = normalize($(el).text());
    let isInternal = true;
    try {
      const resolved = new URL(href, pageUrl);
      isInternal = origin ? resolved.origin === origin : true;
    } catch {
      isInternal = true;
    }
    links.push({
      href,
      text,
      isInternal,
      isGenericAnchor: isGenericAnchor(text),
    });
  });

  const jsonLd: JsonLdBlock[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    try {
      const parsed = JSON.parse(raw);
      const types = extractTypes(parsed);
      jsonLd.push({ raw, parsed, types, parseError: false });
    } catch {
      jsonLd.push({ raw, parsed: null, types: [], parseError: true });
    }
  });

  const openGraph: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr("property");
    const content = $(el).attr("content");
    if (property && content) openGraph[property] = content;
  });

  const twitter: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr("name");
    const content = $(el).attr("content");
    if (name && content) twitter[name] = content;
  });

  return {
    url: pageUrl,
    title: title || null,
    metaDescription,
    canonical,
    robotsMeta,
    lang,
    viewport,
    hreflang,
    headings,
    paragraphs,
    listItems,
    images,
    links,
    jsonLd,
    openGraph,
    twitter,
    wordCount,
    visibleText,
  };
}

function normalize(text: string): string {
  return collapseWhitespace(text);
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function numOrNull(val: string | undefined): number | null {
  if (!val) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function extractTypes(node: unknown): string[] {
  const types: string[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if (typeof obj["@type"] === "string") types.push(obj["@type"]);
      if (Array.isArray(obj["@type"])) {
        obj["@type"].forEach((t) => typeof t === "string" && types.push(t));
      }
      if (Array.isArray(obj["@graph"])) obj["@graph"].forEach(visit);
    }
  };
  visit(node);
  return types;
}
