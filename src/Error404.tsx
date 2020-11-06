import React from 'react';
import Link from './shared/Link';
import Page from './shared/Page';

export default function Error404Page() {
  return (
    <Page title="Not Found">
      <h1>Page not found</h1>
      <p>
        Go to <Link href="/">home page</Link>
      </p>
    </Page>
  );
}
