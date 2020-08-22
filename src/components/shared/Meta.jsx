import React from 'react';
import Helmet from 'react-helmet';

import config from '../../config';
import { getAbsoluteUrl, isAbsoluteUrl } from '../../utils';
import useSiteMetadata from './useSiteMetadata';

export default ({ title, description, imageUrl }) => {
  const siteMetadata = useSiteMetadata();

  // Append site title to page title
  const actualTitle = title ? `${title} | ${siteMetadata.title}` : siteMetadata.title;

  // Use fallback description if it's not set
  const actualDescription = description || siteMetadata.description;

  // Automatically root image URL
  const actualImageUrl = imageUrl && !isAbsoluteUrl(imageUrl) ? getAbsoluteUrl(config.siteDomain, imageUrl) : imageUrl;

  return (
    <Helmet>
      <html lang="en" />

      <title>{actualTitle}</title>

      <meta name="description" content={actualDescription} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={actualTitle} />
      <meta property="og:description" content={actualDescription} />
      <meta property="og:image" content={actualImageUrl} />

      <meta name="twitter:title" content={actualTitle} />
      <meta name="twitter:site" content={`@${siteMetadata.twitter}`} />
      <meta name="twitter:creator" content={`@${siteMetadata.twitter}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={actualDescription} />
      <meta name="twitter:image" content={actualImageUrl} />
    </Helmet>
  );
};
