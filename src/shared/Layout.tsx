import Head from 'next/head';
import React, { useState } from 'react';
import config from '../infra/config';
import { getAbsoluteUrl, isAbsoluteUrl } from '../infra/utils';
import './layout.scss';
import Link from './link';

interface Meta {
  title?: string | undefined;
  description?: string | undefined;
  keywords?: string[] | undefined;
  imageUrl?: string | undefined;
}

interface MetaInjectorProps {
  meta?: Meta | undefined;
}

function MetaInjector({ meta }: MetaInjectorProps) {
  const defaults = {
    title: 'Alexey Golub',
    description:
      'Alexey Golub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker'
  };

  const actual = {
    title: meta?.title ? `${meta.title} | ${defaults.title}` : defaults.title,
    description: meta?.description || defaults.description,
    keywords: meta?.keywords?.join(', ') ?? '',
    imageUrl:
      meta?.imageUrl && !isAbsoluteUrl(meta.imageUrl)
        ? getAbsoluteUrl(config.siteUrl, meta.imageUrl)
        : meta?.imageUrl
  };

  return (
    <Head>
      <html lang="en" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>{actual.title}</title>

      <meta name="description" content={actual.description} />
      <meta name="keywords" content={actual.keywords} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={actual.title} />
      <meta property="og:description" content={actual.description} />
      <meta property="og:image" content={actual.imageUrl} />

      <meta name="twitter:title" content={actual.title} />
      <meta name="twitter:site" content="@Tyrrrz" />
      <meta name="twitter:creator" content="@Tyrrrz" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={actual.description} />
      <meta name="twitter:image" content={actual.imageUrl} />
    </Head>
  );
}

function Navigation() {
  const [navbarExpanded, setNavbarExpanded] = useState(false);

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand mr-5">
        <Link className="navbar-item is-size-3 has-text-weight-semibold" href="/">
          Alexey Golub
        </Link>

        <a
          role="button"
          className={`navbar-burger ${navbarExpanded && 'is-active'}`}
          aria-label="menu"
          aria-expanded="false"
          onClick={() => setNavbarExpanded(!navbarExpanded)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div className={`navbar-menu ${navbarExpanded && 'is-active'}`}>
        <Link className="navbar-item is-size-5" href="/">
          Home
        </Link>

        <Link className="navbar-item is-size-5" href="/blog">
          Blog
        </Link>

        <Link className="navbar-item is-size-5" href="/projects">
          Projects
        </Link>

        <Link className="navbar-item is-size-5" href="/talks">
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

      <main className="mt-6 pb-6">{children}</main>
    </div>
  );
}
