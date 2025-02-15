"use client";

import ThreeDotsLoading from "@/components/icon/three-dots-loading";
import { useChat } from "ai/react";
import { AnimatePresence, motion } from "motion/react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { PaperPlaneTilt, Robot, Spinner } from "@phosphor-icons/react";
import { marked } from "marked";
import { ToolCall } from "@/components/ui/chat/tool-call";
import { AskForConfirmation } from "@/components/ui/chat/ask-for-conifrmation";
import { useEffect, useRef, useState } from "react";
import { generateId } from "ai";
import { Event } from "@/lib/tools/events";
import { EventDetailMarket } from "@/components/ui/chat/event-detail-market";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { ClobClient, OrderType, Side } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import { ethers } from "ethers";
import { abi } from "./abi";
import { useCredsStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const getSigner = async () => {
  const ethereum = window.ethereum as ethers.providers.ExternalProvider;
  if (!ethereum) throw new Error("Ethereum provider not found");
  const provider = new ethers.providers.Web3Provider(ethereum);
  return provider.getSigner();
};

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [safeBalance, setSafeBalance] = useState<string>("0");

  const creds = useCredsStore((state) => state.creds);
  const setCreds = useCredsStore((state) => state.setCreds);

  const { address } = useAccount();
  const { data: safeAddress } = useReadContract({
    abi,
    address: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E",
    functionName: "getSafeAddress",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  const { data: balance } = useBalance({
    address: safeAddress,
    token: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    query: {
      enabled: !!safeAddress,
      retry: true,
    },
  });

  const { messages, input, isLoading, handleInputChange, handleSubmit, addToolResult, append } = useChat({
    body: {
      safeBalance,
      safeAddress,
    },
    onFinish: () => {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollDown();
      }, 300);
    },
  });

  // Setup creds for ClobClient
  useEffect(() => {
    const checkApiKey = async () => {
      const signer = await getSigner();
      const clobClient = new ClobClient("https://clob.polymarket.com", 137, signer!, undefined, SignatureType.POLY_GNOSIS_SAFE, safeAddress);
      const getCreds = await clobClient.deriveApiKey();
      if (!getCreds) {
        const createCreds = await clobClient.createApiKey();
        setCreds({
          key: createCreds.key,
          secret: createCreds.secret,
          passphrase: createCreds.passphrase,
        });
      } else {
        setCreds({
          key: getCreds.key,
          secret: getCreds.secret,
          passphrase: getCreds.passphrase,
        });
      }
    };

    if (safeAddress && creds === undefined) {
      checkApiKey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeAddress, creds]);

  // Set safe balance
  useEffect(() => {
    if (balance) {
      setSafeBalance(balance.formatted);
    }
  }, [balance]);

  // Check messages to add suggestions
  useEffect(() => {
    const lastMessage = messages.at(-1);
    const toolInvocation = lastMessage?.parts?.find((part) => part.type === "tool-invocation")?.toolInvocation;
    if (toolInvocation && toolInvocation.state === "result") {
      const toolName = toolInvocation.toolName;
      if (toolName === "events") {
        setSuggestions(toolInvocation.result.map((event: Event) => event.title));
      }
    } else {
      setSuggestions([]);
    }
  }, [messages]);

  useEffect(() => {
    let intervalId;
    if (isLoading) {
      intervalId = setInterval(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop += 20;
        }
      }, 100);
    } else {
      clearInterval(intervalId);
    }
  }, [isLoading]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const executeOrder = async (callId: string, args: any) => {
    const signer = await getSigner();
    const clobClient = new ClobClient("https://clob.polymarket.com", 137, signer!, creds, SignatureType.POLY_GNOSIS_SAFE, safeAddress);

    const order = await clobClient.createOrder({
      tokenID: args.tokenID,
      price: args.price / 100,
      side: args.side === "buy" ? Side.BUY : Side.SELL,
      size: args.size,
    });

    const resp = await clobClient.postOrder(order, OrderType.GTC);
    if (resp.success) {
      addToolResult({
        toolCallId: callId,
        result: "Order successfully placed. Order ID: " + resp.orderId,
      });
    } else {
      addToolResult({
        toolCallId: callId,
        result: "Order failed. Error: " + resp.errorMsg,
      });
    }
  };

  const addMessage = (role: "system" | "user" | "assistant" | "data", message: string) => {
    append({
      id: generateId(),
      role,
      content: message,
    });
  };

  const scrollDown = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current?.scrollHeight + 100;
    }
  };

  return (
    <div className="w-full h-screen">
      <nav className="w-full h-16 flex items-center justify-between fixed top-0 inset-x-0 z-50 bg-white/5 backdrop-blur-xl border-b border-gray-800 px-4">
        <div>Pollay</div>
        <div>
          {/* @ts-expect-error msg */}
          <appkit-button />
        </div>
      </nav>

      <div
        className="h-full w-full rounded-md bg-gray-950 relative overflow-hidden"
        style={{
          backgroundColor: `#030712`,
          opacity: 1,
          backgroundImage: `radial-gradient(#0f172a 1.25px, #030712 1.25px)`,
          backgroundSize: `24px 24px`,
        }}
      >
        <Spotlight />
        <AnimatePresence>
          {messages?.length > 0 ? (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              key="chat"
              className="w-full h-full overflow-y-auto pb-24 pt-20"
              id="chat-container"
              ref={chatContainerRef}
            >
              <div className="max-w-2xl mx-auto w-full px-4">
                {messages.map((m, index) => (
                  <div key={m.id}>
                    {m.parts.map((part) => {
                      const key = m.id + "-" + part.type;
                      const partToolInvocation = m.parts.find((part) => part.type === "tool-invocation")?.toolInvocation;
                      switch (part.type) {
                        case "text":
                          return (
                            <div className="flex items-end gap-2 mb-2" key={key}>
                              {m.role === "assistant" && (
                                <div className="size-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-white/70">
                                  {isLoading && index === messages.length - 1 ? <ThreeDotsLoading className="size-6" /> : <Robot size={16} />}
                                </div>
                              )}
                              <div className={`flex-1 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`relative overflow-hidden inline-block max-w-[80%] rounded-t-2xl border border-gray-700 p-3 text-sm shadow-sm ${
                                    m.role === "user"
                                      ? "rounded-bl-2xl bg-white/90 text-gray-950"
                                      : "rounded-br-2xl bg-gradient-to-tr from-gray-900 to-gray-800 text-white"
                                  }`}
                                >
                                  <div
                                    // @ts-expect-error: marked.parse returns HTML string
                                    dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }}
                                    className={`${m.role === "assistant" ? "prose prose-invert" : ""}`}
                                  ></div>

                                  {partToolInvocation && partToolInvocation.state === "result" && partToolInvocation.toolName === "eventDetail" && (
                                    <EventDetailMarket markets={partToolInvocation.result.markets} onOutcomeClicked={(msg) => addMessage("user", msg)} />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        case "tool-invocation": {
                          const callId = part.toolInvocation.toolCallId;
                          switch (part.toolInvocation.toolName) {
                            case "events": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return <ToolCall key={key} state="loading" text="Getting events from Polymarket..." />;
                                case "result":
                                  return <ToolCall key={key} state="result" text={`${part.toolInvocation.result.length} events found in Polymarket`} />;
                              }
                              break;
                            }
                            case "eventDetail": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return <ToolCall key={key} state="loading" text="Getting event details from Polymarket..." />;
                                case "result":
                                  return <ToolCall key={key} state="result" text="Successfully fetched event details." />;
                              }
                              break;
                            }
                            case "perplexity": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return <ToolCall key={key} state="loading" text="Analyzing data using perplexity..." />;
                                case "result":
                                  return <ToolCall key={key} state="result" text="Successfully analyzed data using perplexity." />;
                              }
                              break;
                            }
                            case "order": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return <ToolCall key={key} state="loading" text="Getting order details from Polymarket..." />;
                                case "result":
                                  return <ToolCall key={key} state="failed" text="Failed to fetched order details." />;
                              }
                            }
                            case "cancelOrder": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return <ToolCall key={key} state="loading" text="Cancelling order from Polymarket..." />;
                                case "result":
                                  return <ToolCall key={key} state="failed" text="Failed to cancel order." />;
                              }
                            }
                            case "cancelAllOrder": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return <ToolCall key={key} state="loading" text="Cancelling all orders from Polymarket..." />;
                                case "result":
                                  return <ToolCall key={key} state="failed" text="Failed to cancel all orders." />;
                              }
                            }
                            case "placeOrder": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return (
                                    <Button key={key + "-" + part.toolInvocation.toolName} onClick={() => executeOrder(callId, part.toolInvocation.args)}>
                                      Execute Order
                                    </Button>
                                  );
                                case "result":
                                  return <ToolCall key={key} state="result" text={part.toolInvocation.result} />;
                              }
                            }
                            case "askForConfirmation": {
                              switch (part.toolInvocation.state) {
                                case "call":
                                  return (
                                    <AskForConfirmation
                                      key={key}
                                      text={part.toolInvocation.args.message}
                                      onClickYes={() =>
                                        addToolResult({
                                          toolCallId: callId,
                                          result: "Yes, confirmed.",
                                        })
                                      }
                                      onClickNo={() =>
                                        addToolResult({
                                          toolCallId: callId,
                                          result: "No, canceled.",
                                        })
                                      }
                                    />
                                  );
                                case "result":
                                  return <ToolCall key={key} state="result" text={part.toolInvocation.result} />;
                              }
                              break;
                            }
                          }
                        }
                      }
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
                <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-br from-neutral-50 to-neutral-400 bg-opacity-50 pb-2">
                  Your AI-Powered
                  <br />
                  Trading Ally
                </h1>
                <p className="mt-4 font-normal text-base text-neutral-500 max-w-lg text-center mx-auto">
                  Pollay is an AI-driven chatbot that transforms your prediction market experience. Engage in seamless, intuitive conversations to access
                  real-time market insights and execute trades effortlessly
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-4 inset-x-0">
        <div className="max-w-2xl mx-auto px-4">
          <form
            onSubmit={(e) => {
              scrollDown();
              handleSubmit(e);
            }}
            className="w-full relative"
          >
            {!isLoading && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-2 overflow-x-auto whitespace-nowrap">
                {suggestions.map((s) => (
                  <button key={s} className="text-xs bg-gray-200 rounded-full px-2 py-1 text-gray-800" onClick={() => addMessage("user", s)}>
                    {s}
                  </button>
                ))}
              </motion.div>
            )}

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                className="rounded-full w-full bg-gray-900 px-4 py-3 text-sm placeholder:text-white/50 peer disabled:cursor-not-allowed disabled:text-white/30"
                placeholder={address === undefined ? "Connect your wallet to start chatting..." : "Write a message..."}
                value={input}
                disabled={isLoading || address === undefined}
                onChange={handleInputChange}
              />
              <button
                className="absolute right-1 top-1 size-9 flex items-center justify-center rounded-full bg-white/20 text-white/50 peer-focus:text-white peer-focus:rotate-45 transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Spinner size={16} className="animate-spin" /> : <PaperPlaneTilt size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
