import { useRouter } from 'next/dist/client/router';
import InternalLink from 'next/link';
import React from 'react';
import { isAbsoluteUrl } from '../infra/utils';

function isActive(href: string, currentPathname: string) {
  if (!href) return false;
  if (href === '/') return currentPathname === '/';
  return currentPathname === href || currentPathname.startsWith(href + '/');
}

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  target?: string | undefined;
  activeClassName?: string | undefined;
}

export default function Link({
  href,
  target,
  className,
  activeClassName,
  children,
  ...props
}: LinkProps) {
  if (isAbsoluteUrl(href)) {
    return (
      <a {...props} className={className} href={href} target={target}>
        {children}
      </a>
    );
  }

  const router = useRouter();
  const active = isActive(href, router.asPath);

  return (
    <InternalLink href={href}>
      <a {...props} className={`${className} ${active && activeClassName}`}>
        {children}
      </a>
    </InternalLink>
  );
}
