import React from 'react';
import routes from '../routes';
import Link from './link';
import Layout from './layout';
import Meta from './meta';

export default () => (
  <Layout>
    <Meta title="Not found" />

    <h2>Page not found</h2>
    <p>
      Go to <Link to={routes.static.home.path}>home page</Link>
    </p>
  </Layout>
);