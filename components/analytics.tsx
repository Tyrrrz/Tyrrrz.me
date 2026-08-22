import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    goatcounter?: {
      count?: (options?: { path?: string }) => void;
    };
  }
}

// No-ops entirely if `GOATCOUNTER_URL` isn't configured (local dev, forks).
const Analytics: FC = () => {
  const url = import.meta.env.GOATCOUNTER_URL;
  const location = useLocation();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Automatic on-load tracking is disabled (`no_onload`), since every page
  // view, including the initial one, is instead reported manually below,
  // once the script has finished loading.
  useEffect(() => {
    if (!url) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
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

    window.goatcounter?.count?.({ path: location.pathname });
  }, [url, isScriptLoaded, location.pathname]);

  return null;
};

export default Analytics;
