import { perplexity as perp } from "@ai-sdk/perplexity";
import { generateText, tool } from "ai";
import { z } from "zod";

export const perplexity = tool({
  description: "Analyze the events/markets using perplexity",
  parameters: z.object({
    prompt: z.string().describe("The prompt to analyze the events/markets"),
  }),
  execute: async ({ prompt }) => {
    const { text } = await generateText({
      model: perp("sonar-pro"),
      prompt,
    });

    return text;
  },
});
