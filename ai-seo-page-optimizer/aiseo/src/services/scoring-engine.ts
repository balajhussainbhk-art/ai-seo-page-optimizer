import { scoreWeights } from "@/src/config/scoring";
import type { ScoreBreakdown } from "@/src/types/analysis";
import { clamp } from "@/src/lib/utils";

export interface CategoryScores {
  technicalSeo: number;
  contentCoverage: number;
  headingStructure: number;
  structuredData: number;
  aiSearchReadiness: number;
  internalLinking: number;
}

export function computeScoreBreakdown(categories: CategoryScores): ScoreBreakdown {
  const weighted =
    (categories.technicalSeo * scoreWeights.technicalSeo +
      categories.contentCoverage * scoreWeights.contentCoverage +
      categories.headingStructure * scoreWeights.headingStructure +
      categories.structuredData * scoreWeights.structuredData +
      categories.aiSearchReadiness * scoreWeights.aiSearchReadiness +
      categories.internalLinking * scoreWeights.internalLinking) /
    100;

  return {
    overall: clamp(Math.round(weighted), 0, 100),
    technicalSeo: Math.round(categories.technicalSeo),
    contentCoverage: Math.round(categories.contentCoverage),
    headingStructure: Math.round(categories.headingStructure),
    structuredData: Math.round(categories.structuredData),
    aiSearchReadiness: Math.round(categories.aiSearchReadiness),
    internalLinking: Math.round(categories.internalLinking),
  };
}
