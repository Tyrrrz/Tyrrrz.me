import { FC } from "react";
import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { resolveAbsoluteUrl, resolvePath } from "../utils/assets";

type MetaProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  imageUrl?: string;
  imageLayout?: "aside" | "fill";
  rssUrl?: string;
};

const Meta: FC<MetaProps> = ({ title, description, keywords, imageUrl, imageLayout, rssUrl }) => {
  const siteName = "Oleksii Holub";
  const buildId = import.meta.env.BUILD_ID;
  const location = useLocation();

  const actualTitle = title ? title + " • " + siteName : siteName;

  const actualDescription =
    description ||
    "Oleksii Holub (@tyrrrz) is a software developer, open-source maintainer, tech blogger and conference speaker";

  const actualKeywords = keywords?.join(",") || "";

  const actualImageUrl = resolveAbsoluteUrl(imageUrl || "/logo.png");

  const actualImageLayout = imageLayout || "aside";

  const actualRssUrl = rssUrl && resolveAbsoluteUrl(rssUrl);

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>{actualTitle}</title>

      <link rel="icon" href={resolvePath("/favicon.png")} />
      <link rel="canonical" href={resolveAbsoluteUrl(location.pathname)} />
      <link rel="manifest" href={resolvePath("/manifest.json")} />

      <meta name="application-name" content={siteName} />
      <meta name="build-id" content={buildId} />
      <meta name="description" content={actualDescription} />
      <meta name="keywords" content={actualKeywords} />
      <meta name="theme-color" content="#a855f7" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={actualTitle} />
      <meta property="og:description" content={actualDescription} />
      <meta property="og:image" content={actualImageUrl} />

      <meta name="twitter:title" content={actualTitle} />
      <meta name="twitter:site" content="@Tyrrrz" />
      <meta name="twitter:creator" content="@Tyrrrz" />
      <meta
        name="twitter:card"
        content={actualImageLayout === "fill" ? "summary_large_image" : "summary"}
      />

      {actualRssUrl && (
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={actualRssUrl} />
      )}
    </Head>
  );
};

export default Meta;
