import InternalLink from 'next/link';
import React from 'react';

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  target?: string | undefined;
}

export default function Link({ href, target, children, ...props }: LinkProps) {
  return (
    <InternalLink href={href}>
      <a {...props}>{children}</a>
    </InternalLink>
  );
}
