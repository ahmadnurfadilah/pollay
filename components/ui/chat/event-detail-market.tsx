"use client";

import { Market } from "@/lib/tools/event-detail";
import { ArrowDown } from "@phosphor-icons/react";
import { useState } from "react";

export const EventDetailMarket = ({ markets, onOutcomeClicked }: { markets: Market[]; onOutcomeClicked: (msg: string) => void }) => {
  const [expand, setExpand] = useState(false);

  return (
    <div className={`overflow-hidden transition-all ${expand ? "max-h-full" : "max-h-40"}`}>
      <hr className="my-4 border-gray-600" />
      {!expand && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black h-12 flex items-center justify-center">
          <button className="w-full h-full flex items-center justify-center gap-1 text-xs font-bold" onClick={() => setExpand(!expand)}>
            Expand
            <ArrowDown />
          </button>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {markets.map((market: Market) => (
          <div className="flex items-center justify-between gap-2" key={market.id}>
            {market.groupItemTitle}

            <div className="flex items-center gap-2 text-sm">
              {JSON.parse(market.outcomes).map((outcome: string, index: number) => {
                const outcomePrice = (parseFloat(JSON.parse(market.outcomePrices)[index]) * 100).toFixed(2) + "¢";
                return (
                  <button
                    key={`outcome-` + index}
                    className={`text-xs rounded-full px-2 py-1 text-white ${index === 0 ? "bg-green-500" : "bg-red-500"}`}
                    onClick={() => onOutcomeClicked(`Buy **${market.question}** on **${outcome} (${outcomePrice})**`)}
                  >
                    {outcome} ({outcomePrice})
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
