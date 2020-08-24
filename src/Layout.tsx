import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import Helmet from 'react-helmet';
import config from './infra/config';
import routes from './infra/routes';
import { getAbsoluteUrl, isAbsoluteUrl } from './infra/utils';
import './Layout.scss';
import Link from './shared/Link';

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
  const siteMetadata = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `);

  const actualTitle = meta?.title ? `${meta.title} | ${siteMetadata.title}` : siteMetadata.title;

  const actualDescription = meta?.description || siteMetadata.description;

  const actualKeywords = meta?.keywords?.join(', ') ?? '';

  const actualImageUrl =
    meta?.imageUrl && !isAbsoluteUrl(meta.imageUrl)
      ? getAbsoluteUrl(config.siteUrl, meta.imageUrl)
      : meta?.imageUrl;

  return (
    <Helmet>
      <html lang="en" />

      <title>{actualTitle}</title>

      <meta name="description" content={actualDescription} />
      <meta name="keywords" content={actualKeywords} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={actualTitle} />
      <meta property="og:description" content={actualDescription} />
      <meta property="og:image" content={actualImageUrl} />

      <meta name="twitter:title" content={actualTitle} />
      <meta name="twitter:site" content="@Tyrrrz" />
      <meta name="twitter:creator" content="@Tyrrrz" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={actualDescription} />
      <meta name="twitter:image" content={actualImageUrl} />
    </Helmet>
  );
}

function Navigation() {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item" href={routes.static.home.path}>
          Alexey Golub
        </Link>

        <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className="navbar-menu">
        <Link className="navbar-item" href={routes.static.home.path}>
          Home
        </Link>

        <Link className="navbar-item" href={routes.static.blog.path}>
          Blog
        </Link>

        <Link className="navbar-item" href={routes.static.projects.path}>
          Projects
        </Link>

        <Link className="navbar-item" href={routes.static.talks.path}>
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
    <>
      <MetaInjector meta={meta} />
      <Navigation />
      <main>{children}</main>
    </>
  );
}
