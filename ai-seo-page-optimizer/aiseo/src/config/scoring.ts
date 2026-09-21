/**
 * Weighting for the "Page Optimization Score" (0-100).
 *
 * This is an internal heuristic model, not an official Google or AI
 * search engine score. Adjust weights here only — they must sum to 100.
 */
export const scoreWeights = {
  technicalSeo: 25,
  contentCoverage: 25,
  headingStructure: 15,
  structuredData: 15,
  aiSearchReadiness: 15,
  internalLinking: 5,
} as const;

// Sanity check at module load (dev-time guard, not user-facing).
const total = Object.values(scoreWeights).reduce((a, b) => a + b, 0);
if (total !== 100) {
  // eslint-disable-next-line no-console
  console.warn(`[scoring] scoreWeights sum to ${total}, expected 100.`);
}

export type ScoreCategory = keyof typeof scoreWeights;

export const severityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

export type Severity = keyof typeof severityWeight;
