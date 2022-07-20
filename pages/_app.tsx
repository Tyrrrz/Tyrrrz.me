import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { FC, PropsWithChildren, ReactNode, useEffect, useMemo, useState } from 'react';
import FadeIn from 'react-fade-in';
import Box from '../components/box';
import Link from '../components/link';
import Meta from '../components/meta';
import NavLink from '../components/navlink';
import Stack from '../components/stack';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { getGoogleAnalyticsId, isProduction } from '../utils/env';
import './globals.css';

const Loader: FC = () => {
  const router = useRouter();

  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Only show loading indicator if the navigation takes a while.
  // This prevents indicator from flashing during faster navigation.
  const isVisible = useDebouncedValue(isNavigating, 300);

  useEffect(() => {
    const onRouteChangeStart = () => {
      setIsNavigating(true);
      setProgress(0);
    };

    const onRouteChangeComplete = () => {
      setIsNavigating(false);
      setProgress(1);
    };

    router.events.on('routeChangeStart', onRouteChangeStart);
    router.events.on('routeChangeComplete', onRouteChangeComplete);
    router.events.on('routeChangeError', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
      router.events.off('routeChangeComplete', onRouteChangeComplete);
      router.events.off('routeChangeError', onRouteChangeComplete);
    };
  }, [router]);

  useEffect(() => {
    if (!isNavigating) {
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
  }, [isNavigating]);

  return (
    <Box
      classes={[
        'h-1',
        {
          'bg-purple-500': isVisible,
          'bg-transparent': !isVisible
        }
      ]}
      style={{
        width: `${progress * 100}%`,
        transitionProperty: 'width',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '150ms'
      }}
    />
  );
};

const Header: FC = () => {
  return (
    <Box
      type="header"
      classes={[
        'container',
        'flex',
        'flex-col',
        'sm:flex-row',
        'mx-auto',
        'p-4',
        'items-center',
        'justify-between'
      ]}
    >
      <Box classes={['my-1']}>
        <Link href="/">
          <Box classes={['text-2xl', 'text-center', 'font-mono', 'font-semibold', 'tracking-wide']}>
            ://tyrrrz.me
          </Box>
        </Link>
      </Box>

      <Box type="nav" classes={['px-2']}>
        <Stack orientation="horizontal" gap="large">
          <Box>
            <NavLink href="/">home</NavLink>
          </Box>
          <Box>
            <NavLink href="/projects">projects</NavLink>
          </Box>
          <Box>
            <NavLink href="/blog">blog</NavLink>
          </Box>
          <Box>
            <NavLink href="/speaking">speaking</NavLink>
          </Box>
          <Box>
            <NavLink href="/donate">donate</NavLink>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

const Divider: FC = () => {
  return <Box classes={['h-1', 'mt-1', 'mx-auto', 'bg-neutral-100']} />;
};

const Main: FC<PropsWithChildren> = ({ children }) => {
  // Ensure that fade-in triggers each time the content changes
  const key = useMemo(() => Math.random() * (children?.toString()?.length || 17), [children]);

  return (
    <Box classes={['container', 'mx-auto', 'my-6', 'px-4']}>
      <FadeIn key={key}>{children}</FadeIn>
    </Box>
  );
};

const Scripts: FC = () => {
  const scripts: ReactNode[] = [];

  // Google Analytics (production build only)
  const googleAnalyticsId = getGoogleAnalyticsId();
  if (googleAnalyticsId && isProduction()) {
    scripts.push(
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        strategy="afterInteractive"
      />,

      <Script id="google-analytics" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');
`}
      </Script>
    );
  }

  return <>{scripts}</>;
};

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Meta />

      <Loader />

      <Header />

      <Divider />

      <Main>
        <Component {...pageProps} />
      </Main>

      <Scripts />
    </>
  );
};

export default App;
