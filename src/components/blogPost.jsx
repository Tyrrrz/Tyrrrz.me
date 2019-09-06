import React from 'react'
import styled from '@emotion/styled'
import { graphql } from 'gatsby'
import Icon from '@mdi/react'
import { mdiCalendar, mdiClockOutline } from '@mdi/js'
import { Disqus } from 'gatsby-plugin-disqus'

import { Layout } from './layout'
import { Meta } from './meta'
import { dynamicRoutes } from '../routes'
import settings from '../settings'

import moment from 'moment'

const Title = styled.div`
  font-size: 2em;
`

const MetadataContainer = styled.div`
  margin-top: 0.5em;
  opacity: 0.65;
  font-size: 0.85em;

  svg {
    margin-top: 0.06em;
    vertical-align: top;
    width: 1em;
  }

  span + span {
    margin-left: 1em;
  }
`

const Content = styled.div`
  code {
    font-family: 'Fira Code Light';
    font-size: 0.8em;
    line-height: 1.2em;
  }

  code:not(.hljs) {
    font-family: 'Fira Code';
    background-color: #f0f0f0;
  }
`

export default ({ data: { markdownRemark } }) => {
  const disqusConfig = {
    url: `${settings.siteDomain}${dynamicRoutes.blogPost.getPath(
      markdownRemark.fields.slug
    )}`,
    identifier: `Blog/${markdownRemark.fields.slug}`,
    title: markdownRemark.frontmatter.title,
  }

  return (
    <Layout>
      <Meta
        title={markdownRemark.frontmatter.title}
        description={markdownRemark.excerpt}
      />

      <Title>{markdownRemark.frontmatter.title}</Title>

      <MetadataContainer>
        <span>
          <Icon path={mdiCalendar} /> {markdownRemark.frontmatter.date}
        </span>

        <span>
          <Icon path={mdiClockOutline} />{' '}
          {moment.duration(markdownRemark.timeToRead, 'minutes').humanize()} to
          read
        </span>
      </MetadataContainer>

      <Content dangerouslySetInnerHTML={{ __html: markdownRemark.html }} />

      <Disqus config={disqusConfig} />
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "DD MMMM YYYY")
      }
      fields {
        slug
      }
      html
      excerpt(format: PLAIN, pruneLength: 248)
      timeToRead
    }
  }
`
