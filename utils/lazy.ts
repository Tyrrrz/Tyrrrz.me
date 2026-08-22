// When the site is redeployed, previously built asset files (e.g. JS chunks)
// get deleted from the server. If a user is still browsing an old version of
// the site and navigates to a route whose chunk is no longer available,
// the dynamic import will fail. Instead of showing an error, we detect this
// case and reload the page once, which picks up the latest deployment.
const isStaleAssetError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  return (
    /failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /importing a module script failed/i.test(message)
  );
};

const reloadKey = "stale-asset-reload";

export const lazyImport = <T>(loader: () => Promise<T>) => {
  return async (): Promise<T> => {
    try {
      const result = await loader();

      // Not available during server-side rendering
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(reloadKey);
      }

      return result;
    } catch (error) {
      if (
        typeof window !== "undefined" &&
        isStaleAssetError(error) &&
        !sessionStorage.getItem(reloadKey)
      ) {
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();

        // Prevent the router from rendering an error while the reload is in progress
        return new Promise<T>(() => {});
      }

      throw error;
    }
  };
};
