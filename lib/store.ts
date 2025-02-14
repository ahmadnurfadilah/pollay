import { z } from "zod";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const Creds = z.object({
  key: z.string(),
  secret: z.string(),
  passphrase: z.string(),
});

type Creds = z.infer<typeof Creds>;

interface CredsState {
  creds: Creds | null;
  setCreds: (creds: Creds) => void;
}

export const useCredsStore = create<CredsState>()(
  devtools(
    persist(
      (set) => ({
        creds: null,
        setCreds: (creds) => set({ creds }),
      }),
      {
        name: "bear-storage",
      }
    )
  )
);
