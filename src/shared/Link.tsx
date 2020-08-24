import { Link as InternalLink } from 'gatsby';
import { OutboundLink as ExternalLink } from 'gatsby-plugin-google-analytics';
import React from 'react';
import { isAbsoluteUrl } from '../infra/utils';

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  target?: string | undefined;
}

export default function Link({ href, target, ...props }: LinkProps) {
  return isAbsoluteUrl(href) ? (
    <ExternalLink href={href} eventLabel={href} target={target} {...props} />
  ) : (
    <InternalLink to={href} target={target} {...props} />
  );
}
