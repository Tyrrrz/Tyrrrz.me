import React from 'react'
import { Link } from 'gatsby'

import { Layout } from '../components/layout'
import { Meta } from '../components/meta'
import { staticRoutes } from '../routes'

export default () => (
  <Layout>
    <Meta title="Not found" />

    <h2>Page not found</h2>
    <p>
      Go to <Link to={staticRoutes.home.path}>home page</Link>
    </p>
  </Layout>
)
