import { tool } from "ai";
import { z } from "zod";

export const portfolio = tool({
  description: "Get portfolio details, including current holdings, profitability, and diversification",
  parameters: z.object({
    address: z.string().describe("Wallet address"),
  }),
  execute: async ({ address }) => {
    return `Currently the feature is under development. To see your portfolio details, please check: https://polymarket.com/profile/${address}`;
  },
});
