import { atom, useAtom } from "jotai";
import { Config } from "@/lib/types/profile";

export const configAtom = atom<Config>({} as Config);
export const originalAtom = atom<Config>({} as Config);
export const pendingAtom = atom<Partial<Config>>({});

export function useSaveBar() {
  const [, setConfig] = useAtom(configAtom);
  const [original] = useAtom(originalAtom);
  const [pending, setPending] = useAtom(pendingAtom);

  return {
    pending,
    update: (patch: Partial<Config>) => {
      setConfig((prev) => ({ ...prev, ...patch }));
      setPending((prev) => {
        const next = { ...prev, ...patch };
        return Object.fromEntries(
          Object.entries(next).filter(
            ([k, v]) => v !== original[k as keyof Config],
          ),
        ) as Partial<Config>;
      });
    },
    clear: () => setPending({}),
  };
}
