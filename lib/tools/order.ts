import { tool } from "ai";
import { z } from "zod";

export const placeOrder = tool({
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

export const order = tool({
  description: "Get single order details by order ID",
  parameters: z.object({
    id: z.string().describe("ID of order to get information about"),
    address: z.string().describe("Wallet address"),
  }),
  execute: async ({ address }) => {
    return `Currently the feature is under development. To see your order details, please check: https://polymarket.com/profile/${address}`;
  },
});

export const cancelOrder = tool({
  description: "Cancel an order by order ID",
  parameters: z.object({
    id: z.string().describe("ID of order to cancel"),
  }),
  execute: async ({ id }) => {
    console.log(id);
    return `Currently the feature is under development. You can still cancel your order from: https://polymarket.com`;
  },
});

export const cancelAllOrder = tool({
  description: "Cancel all open order",
  parameters: z.object({}),
  execute: async () => {
    return `Currently the feature is under development. You can still cancel all your open orders from: https://polymarket.com`;
  },
});
