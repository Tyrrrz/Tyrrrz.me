import Head from 'next/head';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const target = '/blog/target-type-inference';

const ReturnTypeInferencePage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    void router.replace(target);
  }, [router]);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
      </Head>
      <p>
        This page has moved. <a href={target}>Click here if you are not redirected.</a>
      </p>
    </>
  );
};

export default ReturnTypeInferencePage;
