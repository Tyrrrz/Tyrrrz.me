import c from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import Link from '~/components/link';
import useTheme from '~/hooks/useTheme';

type NavLinkProps = {
  href: string;
  currentPath: string;
  children: React.ReactNode;
};

const NavLink: FC<NavLinkProps> = ({ href, currentPath, children }) => {
  const isActive = currentPath === href || currentPath.startsWith(href + '/');

  return (
    <div
      className={c(
        'px-2',
        'py-1',
        'border-2',
        {
          'border-transparent': !isActive,
          'border-purple-500': isActive
        },
        'rounded',
        {
          'bg-purple-100': isActive,
          'dark:bg-purple-900': isActive
        },
        'transition-colors',
        'duration-300'
      )}
    >
      <Link variant="discreet" href={href}>
        {children}
      </Link>
    </div>
  );
};

const ThemeSwitcher: FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className={c('text-blue-500', 'dark:text-yellow-500', 'cursor-pointer')}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <FiMoon /> : <FiSun />}
    </button>
  );
};

type HeaderProps = {
  currentPath: string;
};

const Header: FC<HeaderProps> = ({ currentPath }) => {
  const links = useMemo(
    () => [
      { href: '/', label: 'home' },
      { href: '/projects', label: 'projects' },
      { href: '/blog', label: 'blog' },
      { href: '/speaking', label: 'speaking' },
      { href: '/donate', label: 'donate' }
    ],
    []
  );

  const [isMobileNavVisible, setIsMobileNavVisible] = useState(false);

  // Hide mobile nav when the path changes (e.g. when navigating via View Transitions)
  useEffect(() => {
    setIsMobileNavVisible(false);
  }, [currentPath]);

  return (
    <header>
      <div
        className={c(
          'flex',
          'p-4',
          'border-b-2',
          'border-neutral-100',
          'dark:border-neutral-800',
          'items-center',
          'justify-between'
        )}
      >
        {/* Logo */}
        <div className={c('text-xl', 'font-mono', 'font-semibold', 'tracking-wide')}>
          <Link variant="hidden" href="/">
            <span className={c('text-neutral-400')}>://</span>
            <span>tyrrrz.me</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className={c('hidden', 'sm:flex', 'px-2', 'gap-x-2', 'text-lg')}>
          {links.map((link, i) => (
            <NavLink key={i} href={link.href} currentPath={currentPath}>
              {link.label}
            </NavLink>
          ))}

          {/* Theme switcher */}
          <div className={c('flex', 'ml-2', 'mt-0.5', 'text-2xl')}>
            <ThemeSwitcher />
          </div>
        </nav>

        {/* Mobile buttons */}
        <div className={c('sm:hidden', 'flex', 'gap-x-5', 'text-2xl')}>
          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Nav button */}
          <button
            className={c('sm:hidden', { 'text-purple-500': isMobileNavVisible })}
            onClick={() => setIsMobileNavVisible((v) => !v)}
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className={c('sm:hidden', 'overflow-hidden')}>
        <nav
          className={c(
            { '-mt-[100%]': !isMobileNavVisible },
            'p-2',
            'border-b-2',
            'border-neutral-100',
            'dark:border-neutral-800',
            'space-y-1',
            'text-lg',
            'transition-all',
            'duration-300'
          )}
        >
          {links.map((link, i) => (
            <NavLink key={i} href={link.href} currentPath={currentPath}>
              <div>{link.label}</div>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
