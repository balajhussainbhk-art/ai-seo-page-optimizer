import type { Metadata } from "next";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Privacy Policy</h1>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/70">
        <p>
          {siteConfig.productName} analyzes the public webpage URL you submit in order to generate an SEO
          and AI Search optimization report. We do not require an account to run a free analysis.
        </p>
        <p>
          Submitted URLs and extracted page signals (such as titles, headings, and structured data) may be
          processed by our servers and, where AI-enhanced analysis is enabled, by our AI provider, solely to
          generate your report. We do not sell personal data.
        </p>
        <p>
          This page is a placeholder. Replace it with your actual privacy policy before taking the product
          live, including details on analytics, cookies, and data retention.
        </p>
        <p>Questions? Contact us at {siteConfig.supportEmail}.</p>
      </div>
    </div>
  );
}
