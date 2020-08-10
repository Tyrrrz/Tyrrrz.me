import React from 'react';

import routes from '../routes';
import Layout from './Layout';
import Link from './shared/Link';
import Meta from './shared/Meta';

export default () => (
  <Layout>
    <Meta title="Not found" />

    <h2>Page not found</h2>
    <p>
      Go to <Link to={routes.static.home.path}>home page</Link>
    </p>
  </Layout>
);
