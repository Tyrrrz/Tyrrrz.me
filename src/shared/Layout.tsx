import Head from 'next/head';
import React from 'react';
import config from '../infra/config';
import { getAbsoluteUrl, isAbsoluteUrl } from '../infra/utils';
import Link from './link';
import useCanonicalUrl from './useCanonicalUrl';

interface Meta {
  title?: string | undefined;
  description?: string | undefined;
  keywords?: string[] | undefined;
  imageUrl?: string | undefined;
  rssUrl?: string | undefined;
}

interface MetaInjectorProps {
  meta?: Meta | undefined;
}

function ensureAbsoluteUrl(url?: string | undefined) {
  if (!url) return url;
  if (isAbsoluteUrl(url)) return url;
  return getAbsoluteUrl(config.siteUrl, url);
}

function MetaInjector({ meta }: MetaInjectorProps) {
  const canonicalUrl = useCanonicalUrl();

  const defaults = {
    title: 'Alexey Golub',
    description:
      'Alexey Golub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker'
  };

  const actual = {
    title: meta?.title ? `${meta.title} | ${defaults.title}` : defaults.title,
    description: meta?.description || defaults.description,
    keywords: meta?.keywords?.join(', '),
    imageUrl: ensureAbsoluteUrl(meta?.imageUrl),
    rssUrl: ensureAbsoluteUrl(meta?.rssUrl)
  };

  return (
    <Head>
      <html lang="en" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>{actual.title}</title>

      <link rel="canonical" href={canonicalUrl} />

      <meta name="description" content={actual.description} />
      {actual.keywords && <meta name="keywords" content={actual.keywords} />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={actual.title} />
      <meta property="og:description" content={actual.description} />
      {actual.imageUrl && <meta property="og:image" content={actual.imageUrl} />}

      <meta name="twitter:title" content={actual.title} />
      <meta name="twitter:site" content="@Tyrrrz" />
      <meta name="twitter:creator" content="@Tyrrrz" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={actual.description} />
      {actual.imageUrl && <meta name="twitter:image" content={actual.imageUrl} />}

      {actual.rssUrl && (
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={actual.rssUrl} />
      )}
    </Head>
  );
}

function Navigation() {
  return (
    <nav className="d-flex align-items-center py-2 mobile-d-initial">
      <div className="mr-5 mobile-align-center">
        <Link className="fs-4 fw-bold color-inherit decoration-none" href="/">
          Alexey Golub
        </Link>
      </div>

      <div className="flex-grow mobile-align-center">
        <Link className="button fs-2 px-1" activeClassName="fw-semi-bold" href="/">
          Home
        </Link>

        <Link className="button fs-2 px-1" activeClassName="fw-semi-bold" href="/blog">
          Blog
        </Link>

        <Link className="button fs-2 px-1" activeClassName="fw-semi-bold" href="/projects">
          Projects
        </Link>

        <Link className="button fs-2 px-1" activeClassName="fw-semi-bold" href="/talks">
          Talks
        </Link>
      </div>
    </nav>
  );
}

interface LayoutProps {
  meta?: Meta | undefined;
  children: React.ReactNode;
}

export default function Layout({ meta, children }: LayoutProps) {
  return (
    <div className="container">
      <MetaInjector meta={meta} />
      <Navigation />

      <main className="mb-5">{children}</main>
    </div>
  );
}
