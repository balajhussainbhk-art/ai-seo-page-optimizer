import type { MetadataRoute } from "next";
import { siteConfig } from "@/src/config/site";
import { blogPosts } from "@/src/content/blog";

const staticRoutes = [
  "",
  "/features",
  "/pricing",
  "/how-it-works",
  "/seo-page-audit",
  "/ai-search-optimization",
  "/product-page-optimizer",
  "/heading-analyzer",
  "/schema-analyzer",
  "/blog",
  "/privacy",
  "/terms",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  return [...staticEntries, ...blogEntries];
}
