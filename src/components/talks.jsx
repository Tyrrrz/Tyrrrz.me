import React from 'react';
import { graphql } from 'gatsby';
import Layout from './layout';
import Meta from './meta';
import TalkListing from './talkListing';

export const query = graphql`
  query {
    allTalksJson(sort: { fields: date, order: DESC }) {
      nodes {
        ...TalkListingFragment
      }
    }
  }
`;

export default ({ data }) => (
  <Layout>
    <Meta title="Talks" />

    {data.allTalksJson.nodes.map(node => (
      <TalkListing node={node} />
    ))}
  </Layout>
);
