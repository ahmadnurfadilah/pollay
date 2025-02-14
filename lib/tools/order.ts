import { tool } from "ai";
import { z } from "zod";

export const order = tool({
  description: "Place an order to buy or sell selected market.",
  parameters: z.object({
    tokenID: z.string().describe("The token ID of the market. It's not market ID, it's get from **clobTokenIds**"),
    price: z.number().describe("The price of the market in cents."),
    side: z.enum(["buy", "sell"]).describe("The side of the market."),
    size: z.number().describe("The size of the market in shares. Ask the user if they not sure about the size"),
    feeRateBps: z.number().default(100).describe("Fee rate in basis points as required by the operator"),
    nonce: z.number().default(0).describe("Maker's Exchange nonce the order is associated with"),
  }),
});
