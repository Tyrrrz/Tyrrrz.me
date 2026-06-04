import { clsx } from "clsx";
import { FC, useEffect, useMemo, useState } from "react";
import FadeIn from "react-fade-in";
import { FiMenu, FiMoon, FiSun } from "react-icons/fi";
import { Outlet, useLocation } from "react-router-dom";
import Link from "~/components/link";
import Meta from "~/components/meta";
import { useDebounce } from "~/hooks/useDebounce";
import { useRouterStatus } from "~/hooks/useRouterStatus";
import { useTheme } from "~/hooks/useTheme";

const Loader: FC = () => {
  // Only show the loading indicator if the navigation takes a while.
  // This prevents the indicator from flashing during faster navigation.
  const { value: isVisible } = useDebounce(useRouterStatus() === "loading", 300);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const interval = setInterval(() => {
      // Progress is not representative of anything, it's just used
      // to give a sense that something is happening.
      // The value is increased inverse-hyperbolically, so that it
      // gradually slows down and never actually reaches 100%.
      setProgress((progress) => progress + 0.1 * (0.95 - progress) ** 2);
    }, 100);

    return () => {
      clearInterval(interval);
      setProgress(0);
    };
  }, [isVisible]);

  return (
    <div
      className={clsx("h-1", { "bg-purple-500": isVisible })}
      style={{
        width: `${progress * 100}%`,
        transitionProperty: "width",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "150ms",
      }}
    />
  );
};

type NavLinkProps = PropsWithChildren<{
  href: string;
}>;

const NavLink: FC<NavLinkProps> = ({ href, children }) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div
      className={clsx("rounded border-2 px-2 py-1 transition-colors duration-300", {
        "border-transparent": !isActive,
        "border-purple-500": isActive,
        "bg-purple-100": isActive,
        "dark:bg-purple-900": isActive,
      })}
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
      className="cursor-pointer text-blue-500 dark:text-yellow-500"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <FiMoon /> : <FiSun />}
    </button>
  );
};

const Header: FC = () => {
  const links = useMemo(
    () => [
      { href: "/", label: "home" },
      { href: "/projects", label: "projects" },
      { href: "/blog", label: "blog" },
      { href: "/speaking", label: "speaking" },
      { href: "/donate", label: "donate" },
    ],
    [],
  );

  const router = useLocation();
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(false);

  // Hide the mobile nav when the page changes
  useEffect(() => {
    setIsMobileNavVisible(false);
  }, [router.pathname]);

  return (
    <header>
      <div className="flex items-center justify-between border-b-2 border-neutral-100 p-4 dark:border-neutral-800">
        {/* Logo */}
        <div className="font-mono text-xl font-semibold tracking-wide">
          <Link variant="hidden" href="/">
            <span className="text-neutral-400">://</span>
            <span>tyrrrz.me</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden gap-x-2 px-2 text-lg sm:flex">
          {links.map((link, i) => (
            <NavLink key={i} href={link.href}>
              {link.label}
            </NavLink>
          ))}

          {/* Theme switcher */}
          <div className="mt-0.5 ml-2 flex text-2xl">
            <ThemeSwitcher />
          </div>
        </nav>

        {/* Mobile buttons */}
        <div className="flex gap-x-5 text-2xl sm:hidden">
          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Nav button */}
          <button
            className={clsx("sm:hidden", { "text-purple-500": isMobileNavVisible })}
            onClick={() => setIsMobileNavVisible((v) => !v)}
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="overflow-hidden sm:hidden">
        <nav
          className={clsx(
            "space-y-1 border-b-2 border-neutral-100 p-2 text-lg transition-all duration-300 dark:border-neutral-800",
            { "mt-[-100%]": !isMobileNavVisible },
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

const Main: FC = () => {
  // Below is a hack to re-initialize the fade when the page changes
  const location = useLocation();
  const fadeKey = useMemo(() => location.pathname, [location.pathname]);

  return (
    <main className="mx-4 mt-6 mb-20">
      <FadeIn key={fadeKey}>
        <Outlet />
      </FadeIn>
    </main>
  );
};

const Page: FC = () => {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <div className="flex min-h-screen flex-col dark:bg-neutral-900 dark:text-neutral-200">
        <Loader />
        <div className="container mx-auto max-w-4xl">
          <Header />
          <Main />
        </div>
      </div>
    </div>
  );
};

const Layout: FC = () => {
  return (
    <>
      <Meta />
      <Page />
    </>
  );
};

export default Layout;
