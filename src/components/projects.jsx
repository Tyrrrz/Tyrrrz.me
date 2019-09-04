import React from 'react'
import { graphql } from 'gatsby'

import { Layout } from './layout'
import { Meta } from './meta'
import { ProjectListing } from './projectListing'

export default ({ data }) => (
  <Layout>
    <Meta title="Projects" />

    {data.githubUser.repositories.nodes
      .filter(node => node.stargazers.totalCount >= 30)
      .map(node => (
        <ProjectListing node={node} />
      ))}
  </Layout>
)

export const query = graphql`
  query {
    githubUser {
      repositories {
        nodes {
          ...ProjectListingFragment
        }
      }
    }
  }
`
