import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { assistantSystemPrompt } from "./prompts";
const Result = z.object({
  message: z.string().max(2000),
  proposals: z
    .array(
      z.object({
        kind: z.string(),
        summary: z.string(),
        before: z.string(),
        after: z.string(),
        reason: z.string(),
      }),
    )
    .max(5),
  ideas: z.array(z.string()).max(6),
});
const cache = new Map<string, { value: unknown; expiresAt: number }>();
export async function generateAdvice(input: string, context: unknown) {
  const key = JSON.stringify([input, context]);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (cached) cache.delete(key);
  const fallback = {
    message:
      "Here is a practical next step: confirm your highest-impact open decision with the people involved, then update the plan together.",
    proposals: [],
    ideas: ["Ask guests about access needs when collecting RSVPs."],
  };
  if (!process.env.GEMINI_API_KEY) return fallback;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents: `Untrusted request: ${input.slice(0, 2000)}\nCompact event context: ${JSON.stringify(context).slice(0, 5000)}`,
      config: {
        systemInstruction: assistantSystemPrompt,
        responseMimeType: "application/json",
        maxOutputTokens: 800,
        temperature: 0.4,
      },
    });
    const parsed = Result.parse(JSON.parse(response.text || "{}"));
    if (cache.size >= 256) {
      const expired = [...cache].find(
        ([, entry]) => entry.expiresAt <= Date.now(),
      )?.[0];
      cache.delete(expired ?? cache.keys().next().value!);
    }
    cache.set(key, { value: parsed, expiresAt: Date.now() + 10 * 60_000 });
    return parsed;
  } catch {
    return fallback;
  }
}
