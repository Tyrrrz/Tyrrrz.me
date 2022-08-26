import { isAbsoluteUrl } from '@/utils/url';
import c from 'classnames';
import NextLink from 'next/link';
import { FC, PropsWithChildren } from 'react';

type LinkProps = PropsWithChildren<{
  variant?: 'normal' | 'discreet' | 'hidden';
  href: string;
}>;

const Link: FC<LinkProps> = ({ variant = 'normal', href, children }) => {
  const absolute = isAbsoluteUrl(href);

  const link = (
    <a
      className={c({
        'text-blue-500': variant === 'normal',
        'hover:underline': variant === 'normal',
        'hover:text-blue-500': variant === 'discreet'
      })}
      href={href}
      target={absolute ? '_blank' : undefined}
      rel="noreferrer"
    >
      {children}
    </a>
  );

  return absolute ? (
    link
  ) : (
    <NextLink href={href} passHref>
      {link}
    </NextLink>
  );
};

export default Link;
