import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    goatcounter?: {
      count?: (options?: { path?: string }) => void;
    };
  }
}

const Analytics: FC = () => {
  const url = import.meta.env.GOATCOUNTER_URL;
  const location = useLocation();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Inject the GoatCounter script manually (instead of declaratively through
  // <Head>), so we can reliably detect when it's done loading via its native
  // `load` event, and only start reporting page views after that.
  // Automatic on-load tracking is disabled (`no_onload`), since every page
  // view, including the initial one, is instead reported manually below.
  useEffect(() => {
    if (!url) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://gc.zgo.at/count.js";
    script.async = true;
    script.dataset.goatcounter = url;
    script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
    script.addEventListener("load", () => setIsScriptLoaded(true));

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      setIsScriptLoaded(false);
    };
  }, [url]);

  useEffect(() => {
    if (!url || !isScriptLoaded) {
      return;
    }

    // Use window.location instead of the router-relative location, so that
    // the reported path is consistent regardless of whether the site is
    // deployed at the root of a domain or under a sub-path (e.g. on GitHub
    // Pages).
    window.goatcounter?.count?.({
      path: window.location.pathname + window.location.search + window.location.hash,
    });
  }, [url, isScriptLoaded, location.pathname, location.search, location.hash]);

  return null;
};

export default Analytics;
