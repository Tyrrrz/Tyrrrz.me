import c from 'classnames';
import NextLink from 'next/link';
import { FC, PropsWithChildren } from 'react';
import { isAbsoluteUrl } from '~/utils/url';

type LinkProps = PropsWithChildren<{
  variant?: 'normal' | 'discreet' | 'hidden';
  href: string;
  external?: boolean;
}>;

const Link: FC<LinkProps> = ({
  variant = 'normal',
  href,
  external = isAbsoluteUrl(href),
  children
}) => {
  const Proxy = external ? 'a' : NextLink;

  return (
    <Proxy
      className={c({
        'text-blue-500': variant === 'normal',
        'dark:text-blue-300': variant === 'normal',
        'hover:underline': variant === 'normal',
        'hover:text-blue-500': variant === 'discreet',
        'dark:hover:text-blue-300': variant === 'discreet'
      })}
      href={href}
      target={external ? '_blank' : undefined}
      rel="noreferrer"
    >
      {children}
    </Proxy>
  );
};

export default Link;
