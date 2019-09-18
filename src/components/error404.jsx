import React from 'react';
import { Link } from 'gatsby';

import routes from '../routes';

import Layout from '../components/layout';
import Meta from '../components/meta';

export default () => (
  <Layout>
    <Meta title="Not found" />

    <h2>Page not found</h2>
    <p>
      Go to <Link to={routes.static.home.path}>home page</Link>
    </p>
  </Layout>
);
