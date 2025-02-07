import { CheckCircle, SpinnerGap } from "@phosphor-icons/react";

export const ToolCall = ({ state = "loading", text }: { state: string; text: string }) => {
  return (
    <div className={`ml-10 text-xs flex items-center gap-1 mb-2 ${state == "loading" ? "text-gray-500" : "text-lime-600"}`}>
      {state === "loading" ? <SpinnerGap size={12} className="animate-spin" /> : <CheckCircle size={12} />}
      {text}
    </div>
  );
};
