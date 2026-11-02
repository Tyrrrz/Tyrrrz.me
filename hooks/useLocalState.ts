import { useBrowserState } from "./useBrowserState.ts";

export const useLocalState = <T>(key: string, initialState: T) => {
  return useBrowserState("local", key, initialState);
};
