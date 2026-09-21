import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/src/config/site";

export interface LandingSection {
  heading: string;
  body: string;
}

export function SeoLandingTemplate({
  path,
  h1,
  intro,
  sections,
  ctaLabel = "Analyze a page now",
}: {
  path: string;
  h1: string;
  intro: string;
  sections: LandingSection[];
  ctaLabel?: string;
}) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: h1, item: `${siteConfig.url}${path}` },
    ],
  };

  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <h1 className="max-w-2xl font-display text-4xl text-ink">{h1}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink/60">{intro}</p>

      <div className="mt-6">
        <ButtonLink href="/#analyze" variant="signal" size="lg">
          {ctaLabel}
        </ButtonLink>
      </div>

      <div className="mt-14 max-w-2xl space-y-10">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display text-xl text-ink">{s.heading}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
