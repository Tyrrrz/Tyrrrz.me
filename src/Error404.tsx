import React from 'react';
import Layout from './shared/Layout';
import Link from './shared/Link';

export default function Error404Page() {
  return (
    <Layout meta={{ title: 'Not Found' }}>
      <h1>Page not found</h1>
      <p>
        Go to <Link href="/">home page</Link>
      </p>
    </Layout>
  );
}
