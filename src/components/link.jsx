import React from 'react';
import { Link as InternalLink } from 'gatsby';
import { OutboundLink as ExternalLink } from 'gatsby-plugin-google-analytics';

export default ({ to, ...props }) => {
  const isExternal = /^.*?:/.test(to);

  if (isExternal) return <ExternalLink href={to} {...props} />;
  else return <InternalLink to={to} {...props} />;
};
