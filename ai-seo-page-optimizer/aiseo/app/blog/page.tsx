import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/src/content/blog";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Guides on SEO and AI Search optimization from ${siteConfig.productName}.`,
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <h1 className="font-display text-4xl text-ink">Resources</h1>
      <p className="mt-3 max-w-xl text-lg text-ink/60">
        Practical guides on SEO and AI Search optimization.
      </p>

      <div className="mt-12 divide-y divide-line border-t border-line">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block py-7">
            <p className="text-xs text-ink/40">
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h2 className="mt-1.5 text-lg font-medium text-ink group-hover:text-signal">{post.title}</h2>
            <p className="mt-1.5 max-w-xl text-sm text-ink/60">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
