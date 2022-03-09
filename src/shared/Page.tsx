import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import Helmet from 'react-helmet';
import { IconContext } from 'react-icons/lib';
import { getAbsoluteUrl } from '../utils';
import Link from './Link';
import './Page.css';
import useSiteMetadata from './useSiteMetadata';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  imageUrl?: string;
  rssUrl?: string;
  previewLayout?: 'descriptionPriority' | 'imagePriority';
}

const Meta: React.FC<MetaProps> = ({
  title,
  description,
  keywords,
  imageUrl,
  rssUrl,
  previewLayout
}) => {
  const siteMetadata = useSiteMetadata();

  const fallback = {
    title: 'Oleksii Holub',
    description:
      'Oleksii Holub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker',
    imageUrl: useStaticQuery(graphql`
      query {
        image: file(relativePath: { eq: "photo.png" }) {
          childImageSharp {
            original {
              src
            }
          }
        }
      }
    `).image.childImageSharp.original.src as string,
    previewLayout: 'descriptionPriority'
  };

  const actual = {
    title: title ? `${title} | ${fallback.title}` : fallback.title,
    description: description || fallback.description,
    keywords: keywords?.join(', ') || '',
    imageUrl: getAbsoluteUrl(siteMetadata.siteUrl, imageUrl || fallback.imageUrl),
    rssUrl: rssUrl && getAbsoluteUrl(siteMetadata.siteUrl, rssUrl),
    previewLayout: previewLayout || fallback.previewLayout
  };

  return (
    <Helmet>
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
      <meta
        name="twitter:card"
        content={actual.previewLayout === 'imagePriority' ? 'summary_large_image' : 'summary'}
      />
      <meta name="twitter:description" content={actual.description} />
      <meta name="twitter:image" content={actual.imageUrl} />

      <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={actual.rssUrl} />
    </Helmet>
  );
};

const Navigation: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link className="navbar-logo-link" href="/">
          Oleksii Holub
        </Link>
      </div>

      <div className="navbar-links">
        <Link className="navbar-link" activeClassName="navbar-link--active" activeExact href="/">
          Home
        </Link>

        <Link className="navbar-link" activeClassName="navbar-link--active" href="/blog">
          Blog
        </Link>

        <Link className="navbar-link" activeClassName="navbar-link--active" href="/projects">
          Projects
        </Link>

        <Link className="navbar-link" activeClassName="navbar-link--active" href="/speaking">
          Speaking
        </Link>
      </div>
    </nav>
  );
};

interface PageProps extends MetaProps {
  children: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ children, ...props }) => {
  return (
    <IconContext.Provider value={{ style: { marginTop: '0.2rem' } }}>
      <div className="page-container">
        <Meta {...props} />
        <Navigation />

        <main>{children}</main>
      </div>
    </IconContext.Provider>
  );
};

export default Page;
