import React from 'react';
import Link from './shared/Link';
import Page from './shared/Page';

export default function Error404Page() {
  return (
    <Page title="Not Found">
      <div className="section-header">Page not found</div>

      <div className="section-prelude">
        Go to <Link href="/">home page</Link>
      </div>
    </Page>
  );
}
