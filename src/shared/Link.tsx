import { Link as InternalLink } from 'gatsby';
import { OutboundLink as ExternalLink } from 'gatsby-plugin-gtag';
import React from 'react';
import { isAbsoluteUrl } from '../infra/utils';

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  target?: string;
  activeClassName?: string;
  activeExact?: boolean;
}

export default function Link({
  href,
  target,
  className,
  activeClassName,
  activeExact,
  ...props
}: LinkProps) {
  if (isAbsoluteUrl(href)) {
    return <ExternalLink {...props} className={className} href={href} target={target} />;
  }

  return (
    <InternalLink
      {...props}
      className={className}
      activeClassName={activeClassName}
      partiallyActive={!activeExact}
      to={href}
      target={target}
    />
  );
}
