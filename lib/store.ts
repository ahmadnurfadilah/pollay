import { ApiKeyCreds } from "@polymarket/clob-client";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface CredsState {
  creds: ApiKeyCreds | undefined;
  setCreds: (creds: ApiKeyCreds) => void;
}

export const useCredsStore = create<CredsState>()(
  devtools(
    persist(
      (set) => ({
        creds: undefined,
        setCreds: (creds) => set({ creds }),
      }),
      {
        name: "bear-storage",
      }
    )
  )
);
