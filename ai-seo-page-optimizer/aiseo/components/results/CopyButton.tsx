"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — fail silently, no crash.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 text-xs font-medium transition-colors no-print",
        copied ? "border-score-good text-score-good" : "text-ink/60 hover:text-ink hover:border-ink/30"
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}
