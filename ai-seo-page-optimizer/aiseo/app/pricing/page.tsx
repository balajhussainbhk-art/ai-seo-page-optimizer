import type { Metadata } from "next";
import { PricingTable } from "@/components/home/PricingTable";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Simple, transparent pricing for ${siteConfig.productName}. Start with a free page audit, upgrade for unlimited analyses and advanced AI Search recommendations.`,
  alternates: { canonical: "/pricing" },
};

const faqs = [
  {
    q: "Do I need an account for the free plan?",
    a: "No. You can run a limited number of free analyses per day without creating an account.",
  },
  {
    q: "What happens when I reach the free daily limit?",
    a: "You'll see a message letting you know, and you can upgrade to a paid plan for a much larger monthly allowance.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — paid plans are billed monthly with no long-term contract.",
  },
  {
    q: "Is pricing final?",
    a: "These are initial prices as we build out the product. We'll always honor your existing plan price if pricing changes.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-ink">Simple, transparent pricing</h1>
        <p className="mt-3 text-lg text-ink/60">
          Start with a free single-page audit. Upgrade when you need more analyses, deeper AI Search
          recommendations, or saved project history.
        </p>
      </div>

      <div className="mt-12">
        <PricingTable />
      </div>

      <div className="mt-20 max-w-2xl">
        <h2 className="font-display text-2xl text-ink">Frequently asked questions</h2>
        <div className="mt-6 divide-y divide-line border-t border-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <h3 className="text-[15px] font-medium text-ink">{f.q}</h3>
              <p className="mt-1.5 text-sm text-ink/60">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
