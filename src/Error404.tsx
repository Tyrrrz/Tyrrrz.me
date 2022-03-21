import React from 'react';
import Link from './components/Link';
import Page from './components/Page';

const Error404Page: React.FC = () => {
  return (
    <Page title="Not Found">
      <div className="section-header">Page not found</div>

      <div className="section-prelude">
        Go to <Link href="/">home page</Link>
      </div>
    </Page>
  );
};

export default Error404Page;
