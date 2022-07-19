import { useRouter } from 'next/router';
import { FC, PropsWithChildren } from 'react';
import Box from './box';
import Link from './link';

type NavLinkProps = PropsWithChildren<{
  href: string;
}>;

const NavLink: FC<NavLinkProps> = ({ href, children }) => {
  const router = useRouter();
  const isActive = router.route === href;

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
      <Link href={href}>{children}</Link>
    </Box>
  );
};

export default NavLink;
