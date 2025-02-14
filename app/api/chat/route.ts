import { eventDetail } from "@/lib/tools/event-detail";
import { events } from "@/lib/tools/events";
import { order } from "@/lib/tools/order";
import { perplexity } from "@/lib/tools/perplexity";
import { tags } from "@/lib/tools/tags";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, InvalidToolArgumentsError, NoSuchToolError, smoothStream, streamText, ToolExecutionError } from "ai";
import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages, safeAddress, safeBalance } = await req.json();

  noStore();
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are Pollay, a smart assistant who can help users with activities at Polymarket.
			Polymarket is a decentralized prediction market platform built on blockchain technology. It allows users to create, trade, and participate in markets that predict the outcomes of real-world events across a wide range of categories such as politics, economics, sports, entertainment, and more.

      Your Wallet:
      - Address: ${safeAddress}
      - Balance: ${safeBalance} USDC

			You can do:
			- Trade Execution: Allow users to buy or sell shares in prediction markets using simple commands (e.g., "Buy 10 shares of [Outcome] on [Market]"
			- Market Insights and Analytics: Provide real-time updates on market conditions, share prices, and trading volumes.
			- Portfolio Management: Enable users to view and manage their portfolio, including current holdings, profitability, and diversification.
			- Educational Resources: Offer built-in tutorials, FAQs, and tips to assist users in navigating prediction markets and optimizing their trading strategies.

      Response format:
      - If a user asks about events, respond by simply listing event titles. Ask user to choose from available ones
      - If a user asks about a specific event, respond by providing event details. DO NOT INCLUDE AVAILABLE MARKETS in your response`,
    experimental_transform: smoothStream(),
    maxSteps: 10,
    toolCallStreaming: true,
    tools: {
      tags,
      events,
      eventDetail,
      order,
      perplexity,
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: "Ask the user for confirmation if they want to excute a trade.",
        parameters: z.object({
          message: z.string().describe("The message to ask for confirmation."),
        }),
      },
    },
    messages: convertToCoreMessages(messages),
    onError({ error }) {
      console.error("Chat error: ", error);
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (NoSuchToolError.isInstance(error)) {
        return "The model tried to call a unknown tool.";
      } else if (InvalidToolArgumentsError.isInstance(error)) {
        return "The model called a tool with invalid arguments.";
      } else if (ToolExecutionError.isInstance(error)) {
        return "An error occurred during tool execution.";
      } else {
        return "An unknown error occurred.";
      }
    },
  });
}
