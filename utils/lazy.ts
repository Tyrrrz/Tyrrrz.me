// When the site is redeployed, previously built asset files (e.g. JS chunks)
// get deleted from the server. If a user is still browsing an old version of
// the site and navigates to a route whose chunk is no longer available,
// the dynamic import will fail (404). Instead of showing an error, we reload
// the page, which picks up the latest deployment.
export const lazyImport = <T>(loader: () => Promise<T>) => {
  return async (): Promise<T> => {
    try {
      return await loader();
    } catch (error) {
      if (typeof window === "undefined") {
        throw error;
      }

      window.location.reload();

      // Prevent the router from rendering an error while the reload is in progress
      return new Promise<T>(() => {});
    }
  };
};
