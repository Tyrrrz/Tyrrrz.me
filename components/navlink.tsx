import { useRouter } from 'next/router';
import { FC, PropsWithChildren } from 'react';
import Box from './box';
import RawLink from './rawlink';

type NavLinkProps = PropsWithChildren<{
  href: string;
}>;

const NavLink: FC<NavLinkProps> = ({ href, children }) => {
  const router = useRouter();
  const isActive = router.route === href || router.route.startsWith(href + '/');

  return (
    <Box
      classes={[
        'px-2',
        'py-1',
        'rounded',
        'border-2',
        {
          'border-transparent': !isActive,
          'border-purple-500': isActive
        },
        {
          'bg-transparent': !isActive,
          'bg-purple-100': isActive
        },
        'transition',
        'duration-300'
      ]}
    >
      <Box
        classes={[
          {
            'hover:text-blue-500': !isActive
          }
        ]}
      >
        <RawLink href={href}>{children}</RawLink>
      </Box>
    </Box>
  );
};

export default NavLink;
