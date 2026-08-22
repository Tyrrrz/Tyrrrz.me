import { FC, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    goatcounter?: {
      count?: (options?: { path?: string }) => void;
    };
  }
}

const Analytics: FC = () => {
  const location = useLocation();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (!url) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
    script.dataset.goatcounter = import.meta.env.GOATCOUNTER_URL;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!url) {
      return;
    }

    // The initial page view is tracked automatically once the script loads.
    // Subsequent in-app (SPA) navigations need to be tracked manually, since
    // they don't trigger a full page (re)load.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    window.goatcounter?.count?.({ path: location.pathname });
  }, [url, location.pathname]);

  return null;
};

export default Analytics;
