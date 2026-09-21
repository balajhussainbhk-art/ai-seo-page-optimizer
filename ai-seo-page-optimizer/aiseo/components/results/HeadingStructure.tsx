"use client";

import type { HeadingNode } from "@/src/types/analysis";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/results/CopyButton";

function Outline({ nodes }: { nodes: HeadingNode[] }) {
  if (nodes.length === 0) {
    return <p className="text-sm text-ink/45">No headings found.</p>;
  }
  return (
    <ol className="space-y-1.5 font-mono text-sm">
      {nodes.map((h, i) => (
        <li key={i} style={{ paddingLeft: `${(h.level - 1) * 16}px` }} className="text-ink/80">
          <span className="mr-2 text-ink/35">H{h.level}</span>
          {h.text || <span className="italic text-ink/35">(empty)</span>}
        </li>
      ))}
    </ol>
  );
}

export function HeadingStructure({
  current,
  recommended,
}: {
  current: HeadingNode[];
  recommended: HeadingNode[];
}) {
  const recommendedText = recommended.map((h) => `${"  ".repeat(h.level - 1)}H${h.level}: ${h.text}`).join("\n");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <h3 className="text-sm font-medium text-ink">Current Structure</h3>
        <div className="mt-3">
          <Outline nodes={current} />
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-ink">Recommended Structure</h3>
          <CopyButton text={recommendedText} />
        </div>
        <div className="mt-3">
          <Outline nodes={recommended} />
        </div>
      </Card>
    </div>
  );
}
