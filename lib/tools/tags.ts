import { tool } from "ai";
import { z } from "zod";

const Tag = z.object({
  id: z.string(),
  label: z.string(),
  slug: z.string(),
});

type Tag = z.infer<typeof Tag>;

export const tags = tool({
  description: "Get list of available tags/category for filtering events.",
  parameters: z.object({}),
  execute: async () => {
    const res = await fetch(`https://polymarket.com/api/tags/filtered?tag=100221&status=active`);
    const tags = await res.json();
    if (tags?.data?.length > 0) {
      tags.data.map((o: Tag) => ({
        id: o.id,
        label: o.label,
        slug: o.slug,
      }));
    } else {
      return [
        [
          {
            id: "100215",
            label: "All",
            slug: "all",
          },
          {
            id: "2",
            label: "Politics",
            slug: "politics",
          },
          {
            id: "1",
            label: "Sports",
            slug: "sports",
          },
          {
            id: "21",
            label: "Crypto",
            slug: "crypto",
          },
          {
            id: "126",
            label: "Trump",
            slug: "trump",
          },
          {
            id: "101206",
            label: "World Elections",
            slug: "world-elections",
          },
          {
            id: "101659",
            label: "Elon Tweets",
            slug: "elon-tweets",
          },
          {
            id: "100343",
            label: "Mentions",
            slug: "mention-markets",
          },
          {
            id: "101110",
            label: "Creators",
            slug: "creators",
          },
          {
            id: "596",
            label: "Pop Culture",
            slug: "pop-culture",
          },
          {
            id: "107",
            label: "Business",
            slug: "business",
          },
        ],
      ];
    }
  },
});
