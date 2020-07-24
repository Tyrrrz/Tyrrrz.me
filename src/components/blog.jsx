import React from 'react'
import { graphql } from 'gatsby'
import MdiIcon from '@mdi/react'
import { mdiCalendar, mdiClockOutline } from '@mdi/js'
import routes from '../routes'
import { humanizeTimeToRead } from '../utils'
import useSiteMetadata from './hooks/useSiteMetadata'
import Link from './link'
import Separator from './separator'
import Layout from './layout'
import Meta from './meta'

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {
      nodes {
        frontmatter {
          title
          date(formatString: "DD MMMM YYYY")
        }
        fields {
          slug
        }
        excerpt(format: PLAIN, pruneLength: 350)
        timeToRead
      }
    }
  }
`

export default ({ data }) => {
  const siteMetadata = useSiteMetadata()

  const Icon = ({ ...props }) => (
    <MdiIcon
      size='1em'
      css={{
        marginTop: '0.06em',
        verticalAlign: 'top'
      }}
      {...props}
    />
  )

  const Listing = ({ node }) => {
    const slug = node.fields.slug
    const url = routes.dynamic.blogPost.getPath(slug)
    const title = node.frontmatter.title
    const date = node.frontmatter.date
    const excerpt = node.excerpt
    const timeToRead = humanizeTimeToRead(node.timeToRead)

    return (
      <div css={{ '&:not(:last-child)': { marginBottom: '1.5em' } }}>
        {/* Title */}
        <div css={{ fontSize: '1.5em' }}>
          <Link to={url} css={{ textDecoration: 'none' }}>
            {title}
          </Link>
        </div>

        {/* Meta */}
        <div
          css={{
            marginTop: '0.3em',
            opacity: '0.65',
            fontSize: '0.8em',

            'span + span': { marginLeft: '1em' }
          }}
        >
          <span>
            <Icon path={mdiCalendar} /> {date}
          </span>

          <span>
            <Icon path={mdiClockOutline} /> {timeToRead}
          </span>
        </div>

        {/* Excerpt */}
        <div css={{ marginTop: '0.3em' }}>
          {excerpt} <Link to={url}>continue reading</Link>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Meta title='Blog' />

      {data.allMarkdownRemark.nodes.map((node) => (
        <Listing key={node.slug} node={node} />
      ))}

      <Separator />

      <div>
        Want to know when I post a new article? Follow me on{' '}
        <Link to={`https://twitter.com/${siteMetadata.twitter}`}>Twitter</Link>{' '}
        or subscribe to the{' '}
        <Link to={routes.dynamic.blogPost.getPath('rss.xml')}>RSS Feed</Link> ✨
      </div>
    </Layout>
  )
}
