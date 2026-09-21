import Link from "next/link";
import { siteConfig, navConfig } from "@/src/config/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-content px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-lg text-ink">{siteConfig.shortName}</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60">{siteConfig.description}</p>
          </div>
          {Object.entries(navConfig.footer).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-medium text-ink">{heading}</h3>
              <ul className="mt-3 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink/60 hover:text-ink transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.productName}. All rights reserved.</p>
          <p>Scores are internal heuristics, not official rankings from Google or any AI provider.</p>
        </div>
      </div>
    </footer>
  );
}
