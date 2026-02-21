import { AppProps } from 'next/app';
import { FC } from 'react';
import Layout from '~/components/layout';
import '~/pages/globals.css';

// Pages whose pathnames end with .svg or .xml are served as raw content
// (no HTML wrapper, no site layout) — matching the behaviour in _document.tsx.
const App: FC<AppProps> = ({ Component, pageProps, router }) => {
  if (router.pathname.endsWith('.svg') || router.pathname.endsWith('.xml')) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default App;
