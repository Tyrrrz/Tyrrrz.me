import React from 'react';
import Helmet from 'react-helmet';

import useSiteMetadata from './hooks/useSiteMetadata';

export default ({ title, description }) => {
  const siteMetadata = useSiteMetadata();

  // Append site title to page title
  title =
    title !== null && title !== undefined
      ? `${title} | ${siteMetadata.title}`
      : siteMetadata.title;

  // Use fallback description if it's not set
  description = description || siteMetadata.description;

  return (
    <Helmet>
      <html lang="en" />

      <title>{title}</title>

      <meta property="og:type" content="website" />

      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />

      <meta name="twitter:creator" content={`@${siteMetadata.twitter}`} />
      <meta name="twitter:card" content="summary" />

      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
