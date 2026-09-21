import Link from "next/link";
import { Search } from "lucide-react";
import { siteConfig, navConfig } from "@/src/config/site";
import { ButtonLink } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white">
            <Search size={15} strokeWidth={2.5} />
          </span>
          <span className="font-display text-[1.05rem] tracking-tight text-ink">{siteConfig.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navConfig.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-soft text-ink/70 hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden text-sm text-ink/70 hover:text-ink sm:inline">
            Sign In
          </Link>
          <ButtonLink href="/#analyze" size="sm" variant="signal">
            Analyze a Page
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
