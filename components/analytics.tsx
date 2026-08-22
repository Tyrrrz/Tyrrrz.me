import { FC, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";

declare global {
  interface Window {
    goatcounter?: {
      count?: (options?: { path?: string }) => void;
    };
  }
}

// count.js is loaded asynchronously, so `window.goatcounter.count` may not be
// available yet when a hit needs to be reported (in particular, for the very
// first page view). Retry for a short while instead of silently dropping it.
const countWhenReady = (options: { path: string }, attemptsLeft = 20) => {
  if (window.goatcounter?.count) {
    window.goatcounter.count(options);
    return;
  }

  if (attemptsLeft <= 0) {
    return;
  }

  setTimeout(() => countWhenReady(options, attemptsLeft - 1), 100);
};

const Analytics: FC = () => {
  const url = import.meta.env.GOATCOUNTER_URL;
  const location = useLocation();

  useEffect(() => {
    if (!url) {
      return;
    }

    // Automatic tracking is disabled (see the `no_onload` setting below), so
    // every page view, including the initial one, is reported manually here.
    // Use window.location instead of the router-relative location, so that
    // the reported path is consistent regardless of whether the site is
    // deployed at the root of a domain or under a sub-path (e.g. on GitHub
    // Pages).
    countWhenReady({
      path: window.location.pathname + window.location.search + window.location.hash,
    });
  }, [url, location.pathname, location.search, location.hash]);

  if (!url) {
    return null;
  }

  return (
    <Head>
      <script
        data-goatcounter={url}
        data-goatcounter-settings='{"no_onload": true}'
        async
        src="https://gc.zgo.at/count.js"
      />
    </Head>
  );
};

export default Analytics;
