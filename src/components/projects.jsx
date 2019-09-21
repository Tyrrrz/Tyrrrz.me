import React from 'react';
import { graphql } from 'gatsby';

import Layout from './layout';
import Meta from './meta';
import ProjectListing from './projectListing';

export const query = graphql`
  query {
    allProjectsJson(sort: { fields: stars, order: DESC }) {
      nodes {
        ...ProjectListingFragment
      }
    }
  }
`;

export default ({ data }) => (
  <Layout>
    <Meta title="Projects" />

    {data.allProjectsJson.nodes.map(node => (
      <ProjectListing node={node} />
    ))}
  </Layout>
);
