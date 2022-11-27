import Head from 'next/head';
import { FC } from 'react';
import { getBuildId, getSiteUrl } from '~/utils/env';

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
      <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1" />

      <title key="title">{actualTitle}</title>

      <link key="icon" rel="icon" href="/favicon.png" />
      <link key="manifest" rel="manifest" href="/manifest.json" />

      <meta key="application-name" name="application-name" content={siteName} />
      <meta key="build-id" name="build-id" content={buildId} />
      <meta key="description" name="description" content={actualDescription} />
      <meta key="keywords" name="keywords" content={actualKeywords} />
      <meta key="theme-color" name="theme-color" content="#a855f7" />

      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content={siteName} />
      <meta key="og:title" property="og:title" content={actualTitle} />
      <meta key="og:description" property="og:description" content={actualDescription} />
      <meta key="og:image" property="og:image" content={actualImageUrl} />

      <meta key="twitter:title" name="twitter:title" content={actualTitle} />
      <meta key="twitter:site" name="twitter:site" content="@Tyrrrz" />
      <meta key="twitter:creator" name="twitter:creator" content="@Tyrrrz" />
      <meta
        key="twitter:card"
        name="twitter:card"
        content={actualImageLayout === 'fill' ? 'summary_large_image' : 'summary'}
      />

      <link
        key="alternate"
        rel="alternate"
        type="application/rss+xml"
        title="RSS Feed"
        href={actualRssUrl}
      />
    </Head>
  );
};

export default Meta;
