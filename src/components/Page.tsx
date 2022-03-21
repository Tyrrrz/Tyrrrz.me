import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import Helmet from 'react-helmet';
import { getAbsoluteUrl } from '../utils/url';
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

  const actualTitle = title ? `${title} | Oleksii Holub` : 'Oleksii Holub';

  const actualDescription =
    description ||
    'Oleksii Holub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker';

  const actualKeywords = keywords?.join(', ') || '';

  const actualImageUrl = getAbsoluteUrl(
    siteMetadata.siteUrl,
    imageUrl ||
      (useStaticQuery(graphql`
        query {
          image: file(relativePath: { eq: "photo.jpg" }) {
            childImageSharp {
              original {
                src
              }
            }
          }
        }
      `).image.childImageSharp.original.src as string)
  );

  const actualRssUrl = rssUrl && getAbsoluteUrl(siteMetadata.siteUrl, rssUrl);

  const actualPreviewLayout = previewLayout || 'descriptionPriority';

  return (
    <Helmet>
      <html lang="en" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

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
      <meta
        name="twitter:card"
        content={actualPreviewLayout === 'imagePriority' ? 'summary_large_image' : 'summary'}
      />
      <meta name="twitter:description" content={actualDescription} />
      <meta name="twitter:image" content={actualImageUrl} />

      {actualRssUrl && (
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={actualRssUrl} />
      )}
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

const Page: React.FC<MetaProps> = ({ children, ...props }) => {
  return (
    <div className="page-container">
      <Meta {...props} />

      <Navigation />

      <main>{children}</main>
    </div>
  );
};

export default Page;
