import { Check } from "lucide-react";
import { pricingPlans } from "@/src/config/site";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/src/lib/utils";

export function PricingTable() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {pricingPlans.map((plan) => (
        <Card
          key={plan.id}
          className={cn("flex flex-col p-6", plan.highlighted && "border-ink/30 shadow-panel")}
        >
          {plan.highlighted && (
            <span className="mb-3 inline-block w-fit rounded-full bg-signal-light px-2.5 py-0.5 text-[11px] font-medium text-signal-dark">
              Most popular
            </span>
          )}
          <h3 className="text-lg font-medium text-ink">{plan.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-3xl text-ink">{plan.priceLabel}</span>
            <span className="text-sm text-ink/50">{plan.cadence}</span>
          </div>
          <p className="mt-3 text-sm text-ink/60">{plan.description}</p>
          <ul className="mt-5 flex-1 space-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink/75">
                <Check size={15} className="mt-0.5 shrink-0 text-score-good" />
                {feature}
              </li>
            ))}
          </ul>
          <ButtonLink
            href={plan.id === "free" ? "/#analyze" : "/pricing"}
            variant={plan.highlighted ? "signal" : "outline"}
            className="mt-6 w-full"
          >
            {plan.ctaLabel}
          </ButtonLink>
        </Card>
      ))}
    </div>
  );
}
