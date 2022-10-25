import { isAbsoluteUrl } from '@/utils/url';
import c from 'classnames';
import NextLink from 'next/link';
import { FC, PropsWithChildren } from 'react';

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
  const RawLink = external ? 'a' : NextLink;

  return (
    <RawLink
      className={c({
        'text-blue-500': variant === 'normal',
        'hover:underline': variant === 'normal',
        'hover:text-blue-500': variant === 'discreet'
      })}
      href={href}
      target={external ? '_blank' : undefined}
      rel="noreferrer"
    >
      {children}
    </RawLink>
  );
};

export default Link;
