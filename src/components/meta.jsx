import React from 'react';
import Helmet from 'react-helmet';

const normalizeTitle = title => {
  if (title === null || title === undefined) return `Alexey Golub`;

  return `${title} | Alexey Golub`;
};

export const Meta = ({ title, description }) => {
  title = normalizeTitle(title);

  description =
    description ||
    `Alexey Golub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker`;

  return (
    <Helmet>
      <html lang="en" />

      <title>{title}</title>

      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />

      <meta property="og:type" content="website" />

      <meta name="twitter:creator" content="@Tyrrrz" />
      <meta name="twitter:card" content="summary" />

      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
