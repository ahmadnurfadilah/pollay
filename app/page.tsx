"use client";

import { useChat } from "ai/react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { PaperPlaneTilt, Robot } from "@phosphor-icons/react";
import { marked } from "marked";
import ThreeDotsLoading from "@/components/icon/three-dots-loading";
import { ToolCall } from "@/components/ui/chat/tool-call";
import { AskForConfirmation } from "@/components/ui/chat/ask-for-conifrmation";

export default function Home() {
  const { messages, input, isLoading, handleInputChange, handleSubmit, addToolResult } = useChat({
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "getLocation") {
        const cities = ["New York", "Los Angeles", "Chicago", "San Francisco"];
        return cities[Math.floor(Math.random() * cities.length)];
      }
    },
  });

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
        {messages?.length > 0 ? (
          <div className="w-full h-full overflow-y-auto pb-20 pt-20">
            <div className="max-w-2xl mx-auto w-full px-4" id="chat-container">
              {messages.map((m, index) => (
                <div key={m.id}>
                  {m.parts.map((part) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div className="flex items-end gap-2 mb-2" key={m.id + " " + part.type}>
                            {m.role === "assistant" && (
                              <div className="size-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-white/70">
                                {isLoading && index === messages.length - 1 ? <ThreeDotsLoading className="size-6" /> : <Robot size={16} />}
                              </div>
                            )}
                            <div className={`flex-1 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`inline-block max-w-[80%] rounded-t-2xl border border-gray-700 p-3 text-sm shadow-sm prose prose-invert ${
                                  m.role === "user"
                                    ? "rounded-bl-2xl bg-white/90 text-gray-950"
                                    : "rounded-br-2xl bg-gradient-to-tr from-gray-900 to-gray-800 text-white"
                                }`}
                                // @ts-expect-error: marked.parse returns HTML string
                                dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }}
                              ></div>
                            </div>
                          </div>
                        );
                      case "tool-invocation": {
                        const callId = part.toolInvocation.toolCallId;
                        switch (part.toolInvocation.toolName) {
                          case "events": {
                            switch (part.toolInvocation.state) {
                              case "call":
                                return <ToolCall state="loading" text="Getting events from Polymarket..." />;
                              case "result":
                                return <ToolCall state="result" text={`${part.toolInvocation.result.length} events found in Polymarket`} />;
                            }
                            break;
                          }
                          case "askForConfirmation": {
                            switch (part.toolInvocation.state) {
                              case "call":
                                return (
                                  <AskForConfirmation
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
                                return <ToolCall state="result" text={part.toolInvocation.result} />;
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
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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
          </div>
        )}
      </div>

      <div className="fixed bottom-4 inset-x-0">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="w-full relative">
            <input
              type="text"
              className="rounded-full w-full bg-gray-900 px-4 py-3 text-sm placeholder:text-white/50 peer"
              placeholder="Write a message..."
              value={input}
              onChange={handleInputChange}
            />
            <button className="absolute right-1 top-1 size-9 flex items-center justify-center rounded-full bg-white/20 text-white/50 peer-focus:text-white peer-focus:rotate-45 transition-all">
              <PaperPlaneTilt size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
