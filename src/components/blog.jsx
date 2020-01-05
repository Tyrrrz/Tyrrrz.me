import React from 'react';
import { graphql } from 'gatsby';
import Layout from './layout';
import Meta from './meta';
import BlogPostListing from './blogPostListing';

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {
      nodes {
        ...BlogPostListingFragment
      }
    }
  }
`;

export default ({ data }) => (
  <Layout>
    <Meta title="Blog" />

    {data.allMarkdownRemark.nodes.map(node => (
      <BlogPostListing node={node} />
    ))}
  </Layout>
);
