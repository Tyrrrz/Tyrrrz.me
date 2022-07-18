import Head from 'next/head';
import { FC } from 'react';
import { getBuildId, getSiteUrl } from '../utils/env';

type MetaProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  imageUrl?: string;
  imageLayout?: 'aside' | 'fill';
  rssUrl?: string;
};

const Meta: FC<MetaProps> = ({ title, description, keywords, imageUrl, imageLayout, rssUrl }) => {
  const siteName = 'Oleksii Holub';

  const buildId = getBuildId();

  const actualTitle = title ? title + ' • ' + siteName : siteName;

  const actualDescription =
    description ||
    'Oleksii Holub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker';

  const actualKeywords = keywords?.join(',') || '';

  const actualImageUrl = getSiteUrl(imageUrl || '/logo.png');

  const actualImageLayout = imageLayout || 'aside';

  const actualRssUrl = rssUrl && getSiteUrl(rssUrl);

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>{actualTitle}</title>
      <link rel="icon" href="/favicon.png" />
      <link rel="manifest" href="/manifest.json" />

      <meta name="application-name" content={siteName} />
      <meta name="build-id" content={buildId} />
      <meta name="description" content={actualDescription} />
      <meta name="keywords" content={actualKeywords} />
      <meta name="theme-color" content="#343838" />

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
        content={actualImageLayout === 'fill' ? 'summary_large_image' : 'summary'}
      />

      {actualRssUrl && (
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={actualRssUrl} />
      )}
    </Head>
  );
};

export default Meta;
