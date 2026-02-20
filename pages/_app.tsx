import { AppProps } from 'next/app';
import { NextPage } from 'next';
import { FC, ReactElement } from 'react';
import Layout from '~/components/layout';
import '~/pages/globals.css';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement;
};

const App: FC<AppProps & { Component: NextPageWithLayout }> = ({ Component, pageProps }) => {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  return getLayout(<Component {...pageProps} />);
};

export default App;
