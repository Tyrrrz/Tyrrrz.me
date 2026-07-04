import { useCallback, useSyncExternalStore } from "react";

export const useMedia = (query: string) => {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      const onChange = () => callback();

      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false,
  );
};
