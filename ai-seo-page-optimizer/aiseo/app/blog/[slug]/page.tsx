import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/src/content/blog";
import { siteConfig } from "@/src/config/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: siteConfig.productName },
  };

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Link href="/blog" className="text-sm text-ink/50 hover:text-ink">
        ← Back to resources
      </Link>
      <p className="mt-6 text-xs text-ink/40">
        {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">{post.title}</h1>

      <div className="prose-content mt-8 space-y-6">
        {post.body.map((block, i) => (
          <div key={i}>
            {block.heading && <h2 className="mb-2 font-display text-xl text-ink">{block.heading}</h2>}
            {block.paragraphs.map((p, j) => (
              <p key={j} className="mb-3 text-[15px] leading-relaxed text-ink/70">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}
