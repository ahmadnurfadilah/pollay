import { tool } from "ai";
import { z } from "zod";

const Event = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

type Event = z.infer<typeof Event>;

export const events = tool({
  description:
    "Get list of top events. Events typically refers to a specific topic or question that users can place bets on. Events are the broader categories or questions that drive the creation of markets.",
  parameters: z.object({
    limit: z.number().default(20).describe("Limit query results"),
    tag_id: z.string().nullable().describe("Filter by tag ID"),
    active: z.boolean().default(true).describe("Filter by active status"),
    closed: z.boolean().default(false).describe("Filter by closed status"),
    archived: z.boolean().default(false).describe("Filter by archived status"),
  }),
  execute: async ({ limit, tag_id, active, closed, archived }) => {
    const res = await fetch(
      `https://gamma-api.polymarket.com/events/pagination?limit=${limit}&active=${active}&archived=${archived}&closed=${closed}&order=volume24hr&ascending=false&offset=0` +
        (tag_id && `tag_id=${tag_id}`)
    );
    const events = await res.json();
    return events.data.map((o: Event) => ({
      id: o.id,
      title: o.title,
      description: o.description,
    }));
  },
});
