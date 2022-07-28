import c from 'classnames';
import NextLink from 'next/link';
import { FC, PropsWithChildren } from 'react';

type RawLinkProps = PropsWithChildren<{
  className?: string;
  href: string;
}>;

const RawLink: FC<RawLinkProps> = ({ className, href, children }) => {
  const isAbsolute = /^[a-z][a-z\d+\-.]*:/iu.test(href);

  if (isAbsolute) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  } else {
    return (
      <NextLink href={href} passHref>
        <a className={className}>{children}</a>
      </NextLink>
    );
  }
};

type LinkProps = PropsWithChildren<{
  variant?: 'normal' | 'discreet' | 'hidden';
  href: string;
}>;

const Link: FC<LinkProps> = ({ variant = 'normal', href, children }) => {
  return (
    <RawLink
      className={c({
        'text-blue-500': variant === 'normal',
        'hover:underline': variant === 'normal',
        'hover:text-blue-500': variant === 'discreet'
      })}
      href={href}
    >
      {children}
    </RawLink>
  );
};

export default Link;
