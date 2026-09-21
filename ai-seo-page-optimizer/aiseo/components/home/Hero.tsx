import { siteConfig } from "@/src/config/site";
import { AnalyzerApp } from "@/components/analyzer/AnalyzerApp";

export function Hero() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-content px-6 pt-16 sm:pt-24">
        <h1 className="max-w-2xl font-display text-[2.65rem] leading-[1.08] text-ink sm:text-[3.25rem]">
          {siteConfig.tagline}
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/65">{siteConfig.description}</p>
      </div>

      <div className="pb-16 pt-9">
        <AnalyzerApp />
      </div>
    </section>
  );
}
