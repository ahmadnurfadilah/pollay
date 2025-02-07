"use client";

import { Spotlight } from "@/components/ui/spotlight-new";
import { PaperPlaneTilt } from "@phosphor-icons/react";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <nav className="w-full h-16 flex items-center justify-between fixed top-0 inset-x-0 z-50 bg-transparent border-b border-gray-800 px-4">
        <div>Pollay</div>
        <div>
          {/* @ts-expect-error msg */}
          <appkit-button />
        </div>
      </nav>

      <div
        className="h-full w-full rounded-md flex md:items-center md:justify-center bg-gray-950 antialiased bg-grid-white/[0.02] relative overflow-hidden"
        style={{
          backgroundColor: `#030712`,
          opacity: 1,
          backgroundImage: `radial-gradient(#0f172a 1.25px, #030712 1.25px)`,
          backgroundSize: `24px 24px`,
        }}
      >
        <Spotlight />
        <div className="p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
          <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-br from-neutral-50 to-neutral-400 bg-opacity-50 pb-2">
            Your AI-Powered
            <br />
            Trading Ally
          </h1>
          <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            Pollay is an AI-driven chatbot that transforms your prediction market experience. Engage in seamless, intuitive conversations to access real-time
            market insights and execute trades effortlessly
          </p>
        </div>
      </div>

      <div className="fixed bottom-4 inset-x-0">
        <div className="max-w-2xl mx-auto px-4">
          <div className="w-full relative">
            <input type="text" className="rounded-full w-full bg-gray-900 px-4 py-3 text-sm placeholder:text-white/50 peer" placeholder="Write a message..." />
            <button className="absolute right-1 top-1 size-9 flex items-center justify-center rounded-full bg-white/20 text-white/50 peer-focus:text-white peer-focus:rotate-45 transition-all"><PaperPlaneTilt size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
