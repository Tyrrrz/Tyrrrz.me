import c from 'classnames';
import { useRouter } from 'next/router';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import FadeIn from 'react-fade-in';
import { FiMenu } from 'react-icons/fi';
import useDebounce from '../hooks/useDebounce';
import useRouterStatus from '../hooks/useRouterStatus';
import Link from './link';

const Loader: FC = () => {
  const status = useRouterStatus();

  // Only show loading indicator if the navigation takes a while.
  // This prevents indicator from flashing during faster navigation.
  const isVisible = useDebounce(status === 'loading', 300);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const interval = setInterval(() => {
      // Progress is not representative of anything, it's just used
      // to give a sense that something is happening.
      // The value is increased inverse-hyperbolically, so that it
      // slows down and never actually reaches 100%.
      setProgress((progress) => progress + 0.1 * (0.95 - progress) ** 2);
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div
      className={c('h-1', {
        'bg-purple-500': isVisible
      })}
      style={{
        width: `${progress * 100}%`,
        transitionProperty: 'width',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '150ms'
      }}
    />
  );
};

type NavLinkProps = PropsWithChildren<{
  href: string;
}>;

const NavLink: FC<NavLinkProps> = ({ href, children }) => {
  const { route } = useRouter();
  const isActive = route === href || route.startsWith(href + '/');

  return (
    <div
      className={c(
        'px-2',
        'py-1',
        'rounded',
        'border-2',
        {
          'border-transparent': !isActive,
          'border-purple-500': isActive
        },
        {
          'bg-purple-100': isActive
        }
      )}
    >
      <Link variant="discreet" href={href}>
        {children}
      </Link>
    </div>
  );
};

const Header: FC = () => {
  const links = [
    { href: '/', label: 'home' },
    { href: '/projects', label: 'projects' },
    { href: '/blog', label: 'blog' },
    { href: '/speaking', label: 'speaking' },
    { href: '/donate', label: 'donate' }
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={c('border-b-2', 'border-neutral-100')}>
      <div className={c('container', 'flex', 'mx-auto', 'p-4', 'items-center', 'justify-between')}>
        {/* Logo */}
        <div className={c('my-1', 'text-2xl', 'font-mono', 'font-semibold', 'tracking-wide')}>
          <Link variant="hidden" href="/">
            <span className={c('text-neutral-400')}>://</span>
            <span>tyrrrz.me</span>
          </Link>
        </div>

        {/* Full nav */}
        <nav className={c('hidden', 'sm:flex', 'px-2', 'gap-x-2', 'text-lg')}>
          {links.map((link, i) => (
            <NavLink key={i} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile nav button */}
        <button
          className={c('sm:hidden', 'text-2xl', { 'text-purple-500': isMenuOpen })}
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Mobile nav */}
      <div className={c('sm:hidden', 'overflow-hidden')}>
        <nav
          className={c(
            { '-mt-[100%]': !isMenuOpen },
            'p-2',
            'border-t-2',
            'border-neutral-100',
            'space-y-1',
            'text-lg',
            'transition-all',
            'duration-300'
          )}
        >
          {links.map((link, i) => (
            <NavLink key={i} href={link.href}>
              <div>{link.label}</div>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

const Main: FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className={c('container', 'mx-auto', 'my-6', 'px-4')}>
      <FadeIn>{children}</FadeIn>
    </main>
  );
};

type PageProps = PropsWithChildren;

const Page: FC<PageProps> = ({ children }) => {
  return (
    <>
      <Loader />

      <Header />

      <Main>{children}</Main>
    </>
  );
};

export default Page;
