import React from 'react';
import { Link as InternalLink } from 'gatsby';
import { OutboundLink as ExternalLink } from 'gatsby-plugin-google-analytics';

export default ({ to, ...props }) => {
  const isAbsolute = (/^[a-z][a-z\d+\-.]*:/iu).test(to);

  return isAbsolute
    ? <ExternalLink href={to} {...props} />
    : <InternalLink to={to} {...props} />;
};