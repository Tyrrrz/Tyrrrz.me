import Link from '@/components/link';
import Meta from '@/components/meta';
import useDebounce from '@/hooks/useDebounce';
import useRouterStatus from '@/hooks/useRouterStatus';
import c from 'classnames';
import { useRouter } from 'next/router';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import FadeIn from 'react-fade-in';
import { FiMenu } from 'react-icons/fi';
import Tracker from './tracker';

const Loader: FC = () => {
  const status = useRouterStatus();

  // Only show loading indicator if the navigation takes a while.
  // This prevents indicator from flashing during faster navigation.
  const visible = useDebounce(status === 'loading', 300);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
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
  }, [visible]);

  return (
    <div
      className={c('h-1', {
        'bg-purple-500': visible
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
  const active = route === href || route.startsWith(href + '/');

  return (
    <div
      className={c(
        'px-2',
        'py-1',
        'rounded',
        'border-2',
        {
          'border-transparent': !active,
          'border-purple-500': active
        },
        {
          'bg-purple-100': active
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

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <header>
      <div
        className={c(
          'flex',
          'mx-auto',
          'p-4',
          'border-b-2',
          'border-neutral-100',
          'items-center',
          'justify-between'
        )}
      >
        {/* Logo */}
        <div className={c('my-1', 'text-xl', 'font-mono', 'font-semibold', 'tracking-wide')}>
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
          className={c('sm:hidden', 'text-2xl', { 'text-purple-500': menuVisible })}
          onClick={() => setMenuVisible((v) => !v)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Mobile nav */}
      <div className={c('sm:hidden', 'overflow-hidden')}>
        <nav
          className={c(
            { '-mt-[100%]': !menuVisible },
            'p-2',
            'border-b-2',
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
    <main className={c('mx-4', 'mt-6', 'mb-20')}>
      <FadeIn>{children}</FadeIn>
    </main>
  );
};

type PageProps = PropsWithChildren;

const Page: FC<PageProps> = ({ children }) => {
  return (
    <>
      <Meta />
      <Tracker />

      <Loader />

      <div className={c('max-w-4xl', 'mx-auto')}>
        <div className={c('container', 'mx-auto')}>
          <Header />
          <Main>{children}</Main>
        </div>
      </div>
    </>
  );
};

export default Page;
