/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from "ai";
import { z } from "zod";

const Market = z.object({
  id: z.string(),
  question: z.string(),
  groupItemTitle: z.string(),
  description: z.string(),
  clobTokenIds: z.array(z.string()).describe("Binary token pair for market"),
  outcomes: z.array(z.string()).describe("Binary outcomes for market"),
  outcomePrices: z.array(z.string()).describe("Binary outcome prices for market"),
  liquidity: z.number(),
  volume: z.number(),
});

const EventDetail = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  liquidity: z.number(),
  volume: z.number(),
  markets: z.array(Market),
});

export type Market = z.infer<typeof Market>;
export type EventDetail = z.infer<typeof EventDetail>;

export const eventDetail = tool({
  description: "Get event detail by event id. Do not include available markets in the response",
  parameters: z.object({
    id: z.number().describe("Event id"),
  }),
  execute: async ({ id }): Promise<EventDetail> => {
    const res = await fetch(`https://gamma-api.polymarket.com/events/${id}`);
    const event = await res.json();

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      liquidity: event.liquidity,
      volume: event.volume,
      markets: event.markets.map(
        (m: any): Market => ({
          id: m.id,
          question: m.question,
          groupItemTitle: m.groupItemTitle,
          description: m.description,
          clobTokenIds: JSON.parse(m.clobTokenIds),
          outcomes: JSON.parse(m.outcomes),
          outcomePrices: JSON.parse(m.outcomePrices),
          liquidity: m.liquidity,
          volume: m.volume,
        })
      ),
    };
  },
});
