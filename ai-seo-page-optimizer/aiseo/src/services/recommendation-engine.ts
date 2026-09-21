import type { Issue } from "@/src/types/analysis";
import { severityWeight } from "@/src/config/scoring";

export function consolidateAndRank(issueGroups: Issue[][]): Issue[] {
  const all = issueGroups.flat();
  return [...all].sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
}

export function topPriorityFixes(rankedIssues: Issue[], limit = 5): Issue[] {
  return rankedIssues.slice(0, limit);
}
