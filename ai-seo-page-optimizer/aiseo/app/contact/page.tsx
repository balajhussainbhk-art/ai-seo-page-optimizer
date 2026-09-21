import type { Metadata } from "next";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Contact us</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink/70">
        Questions, feedback, or partnership inquiries? Reach us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`} className="text-signal underline underline-offset-4">
          {siteConfig.supportEmail}
        </a>
        .
      </p>
    </div>
  );
}
