import React from 'react';
import { graphql } from 'gatsby';

import styled from '@emotion/styled';
import MdiIcon from '@mdi/react';
import { mdiCalendar, mdiClockOutline } from '@mdi/js';
import { Disqus } from 'gatsby-plugin-disqus';

import settings from '../settings';
import routes from '../routes';

import Layout from './layout';
import Meta from './meta';
import { humanizeTimeToRead } from '../utils';

const Icon = styled(MdiIcon)`
  margin-top: 0.06em;
  vertical-align: top;
  width: 1em;
`;

const Title = styled.div`
  font-size: 2em;
`;

const MetadataContainer = styled.div`
  margin-top: 0.5em;
  opacity: 0.65;
  font-size: 0.85em;

  span + span {
    margin-left: 1em;
  }
`;

const Content = styled.div`
  code {
    font-family: 'Fira Code', 'Consolas', 'Courier New', 'Courier', monospace;
    font-size: 0.8em;
    font-weight: 300;
    line-height: 1.2em;
  }

  code:not(.hljs) {
    background-color: #f0f0f0;
  }
`;

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "DD MMMM YYYY")
        cover {
          childImageSharp {
            original {
              src
            }
          }
        }
      }
      fields {
        slug
      }
      html
      excerpt(format: PLAIN, pruneLength: 248)
      timeToRead
    }
  }
`;

export default ({ data }) => {
  const coverImageUrl =
    data.markdownRemark.frontmatter.cover &&
    new URL(
      data.markdownRemark.frontmatter.cover.childImageSharp.original.src,
      settings.siteDomain
    );

  const disqusConfig = {
    url: new URL(
      routes.dynamic.blogPost.getPath(data.markdownRemark.fields.slug),
      settings.siteDomain
    ),
    identifier: `Blog/${data.markdownRemark.fields.slug}`,
    title: data.markdownRemark.frontmatter.title
  };

  return (
    <Layout>
      <Meta
        title={data.markdownRemark.frontmatter.title}
        description={data.markdownRemark.excerpt}
        image={coverImageUrl}
      />

      <Title>{data.markdownRemark.frontmatter.title}</Title>

      <MetadataContainer>
        <span>
          <Icon path={mdiCalendar} />
          {` `}
          {data.markdownRemark.frontmatter.date}
        </span>

        <span>
          <Icon path={mdiClockOutline} />
          {` `}
          {humanizeTimeToRead(data.markdownRemark.timeToRead)}
        </span>
      </MetadataContainer>

      <Content dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }} />

      <Disqus config={disqusConfig} />
    </Layout>
  );
};
