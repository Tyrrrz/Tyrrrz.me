import { AppProps } from 'next/app';
import { NextPage } from 'next';
import { FC } from 'react';
import Layout from '~/components/layout';
import '~/pages/globals.css';

type NextPageWithLayout = NextPage & {
  // When true, the page is rendered without the shared site layout
  // (header, footer, etc.). Used for pages like SVG images that
  // need to return raw content rather than an HTML document.
  skipLayout?: boolean;
};

const App: FC<AppProps & { Component: NextPageWithLayout }> = ({ Component, pageProps }) => {
  // If the page opts out of the layout, render it directly
  if (Component.skipLayout) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default App;
