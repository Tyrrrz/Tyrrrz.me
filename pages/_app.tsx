import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { FC, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import Box from '../components/box';
import Link from '../components/link';
import Meta from '../components/meta';
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
          'bg-blue-500': isVisible,
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
    <Link href="/">
      <Box classes={['border-b', 'bg-white', 'hover:bg-neutral-50']}>
        <Box
          type="header"
          classes={[
            'flex',
            'w-fit',
            'mx-auto',
            'px-4',
            'py-6',
            'items-center',
            'gap-x-4',
            'sm:gap-x-6',
            'text-neutral-900'
          ]}
        >
          <Box classes={['w-px', 'h-12', 'sm:h-16', 'bg-neutral-600']} />

          <Box>
            <Box classes={['flex', 'text-3xl', 'sm:text-4xl']}>
              <Box classes={['p-1', 'pl-2', 'sm:pb-2', 'bg-ukraine-blue', 'text-white']}>
                Spelling
              </Box>
              <Box classes={['p-1', 'pr-2', 'sm:pb-2', 'bg-ukraine-yellow']}>Ukraine</Box>
            </Box>

            <Box classes={['mt-1', 'text-sm', 'sm:text-xl', 'font-light', 'sm:tracking-wide']}>
              Language is political. Transliterate correctly.
            </Box>
          </Box>
        </Box>
      </Box>
    </Link>
  );
};

const Main: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box classes={['flex-grow', 'bg-white']}>
      <Box type="main" classes={['container', 'mx-auto', 'mt-6', 'mb-8', 'px-4']}>
        {children}
      </Box>
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

      <Box classes={['flex', 'flex-col', 'min-h-screen', 'bg-neutral-50']}>
        <Loader />

        <Header />

        <Main>
          <Component {...pageProps} />
        </Main>
      </Box>

      <Scripts />
    </>
  );
};

export default App;
