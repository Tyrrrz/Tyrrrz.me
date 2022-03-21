import { Link as InternalLink } from 'gatsby';
import { OutboundLink as ExternalLink } from 'gatsby-plugin-gtag';
import React from 'react';

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  target?: string;
  activeClassName?: string;
  activeExact?: boolean;
}

const Link: React.FC<LinkProps> = ({
  href,
  target,
  className,
  activeClassName,
  activeExact,
  ...props
}) => {
  const isAbsolute = /^[a-z][a-z\d+\-.]*:/iu.test(href);

  if (isAbsolute) {
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
};

export default Link;
