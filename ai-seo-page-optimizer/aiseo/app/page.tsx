import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { PricingTable } from "@/components/home/PricingTable";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.productName} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-ink">Simple, transparent pricing</h2>
              <p className="mt-2 text-ink/60">Start free. Upgrade when you need more analyses.</p>
            </div>
            <Link href="/pricing" className="text-sm text-signal hover:underline underline-offset-4">
              Full pricing details
            </Link>
          </div>
          <div className="mt-10">
            <PricingTable />
          </div>
        </div>
      </section>
    </>
  );
}
