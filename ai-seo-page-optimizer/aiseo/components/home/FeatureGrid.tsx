import { FileSearch, ListTree, Database, Sparkles, ShoppingBag, MapPin } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Technical SEO audit",
    description: "Title, meta description, canonical, indexability, HTTPS, viewport, and more — checked in seconds.",
  },
  {
    icon: ListTree,
    title: "Heading structure analysis",
    description: "See your current H1–H3 outline next to a recommended structure, with one click to copy it.",
  },
  {
    icon: Sparkles,
    title: "AI Search readiness",
    description: "An internal heuristic score for how easily AI systems can interpret and extract your content.",
  },
  {
    icon: Database,
    title: "Structured data recommendations",
    description: "Detect existing Schema.org markup and get suggested JSON-LD for what's missing.",
  },
  {
    icon: ShoppingBag,
    title: "Product page mode",
    description: "Automatic detection of product pages with pricing, availability, and Product schema checks.",
  },
  {
    icon: MapPin,
    title: "Local business mode",
    description: "Checks for LocalBusiness schema, address, hours, and contact information.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-display text-3xl text-ink">Everything you need to fix a page</h2>
        <p className="mt-2 max-w-xl text-ink/60">
          One audit covers traditional SEO signals and AI Search optimization opportunities together.
        </p>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <f.icon size={20} className="text-signal" strokeWidth={1.75} />
              <h3 className="mt-3 text-[15px] font-medium text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
