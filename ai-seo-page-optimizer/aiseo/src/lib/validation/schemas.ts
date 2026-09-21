import { z } from "zod";

export const analyzeRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Please enter a URL.")
    .max(2048, "URL is too long.")
    .refine((val) => /^https?:\/\//i.test(val), {
      message: "URL must start with http:// or https://",
    }),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

/** Shape returned by the AI analyzer. Validated before it touches the report. */
export const aiAnalysisSchema = z.object({
  contentScore: z.number().min(0).max(100),
  aiSearchScore: z.number().min(0).max(100),
  questions: z.array(
    z.object({
      question: z.string(),
      status: z.enum(["covered", "partial", "missing"]),
      note: z.string(),
    })
  ),
  entities: z.array(z.object({ entity: z.string(), covered: z.boolean() })),
  contentGaps: z.array(z.string()),
  recommendations: z.array(
    z.object({
      title: z.string(),
      whyItMatters: z.string(),
      recommendation: z.string(),
      severity: z.enum(["critical", "high", "medium", "low"]),
    })
  ),
});

export type AiAnalysisOutput = z.infer<typeof aiAnalysisSchema>;
