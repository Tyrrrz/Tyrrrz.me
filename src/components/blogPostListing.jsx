import React from 'react';
import { graphql, Link } from 'gatsby';

import styled from '@emotion/styled';
import MdiIcon from '@mdi/react';
import { mdiCalendar, mdiClockOutline } from '@mdi/js';

import routes from '../routes';
import { humanizeTimeToRead } from '../utils';

const Icon = styled(MdiIcon)`
  margin-top: 0.06em;
  vertical-align: top;
  width: 1em;
`;

const Container = styled.div`
  &:not(:last-child) {
    margin-bottom: 1.5em;
  }
`;

const Title = styled.div`
  font-size: 1.5em;

  a {
    text-decoration: none;
  }
`;

const MetadataContainer = styled.div`
  margin-top: 0.3em;
  opacity: 0.65;
  font-size: 0.8em;

  span + span {
    margin-left: 1em;
  }
`;

const Excerpt = styled.div`
  margin-top: 0.3em;
`;

export const query = graphql`
  fragment BlogPostListingFragment on MarkdownRemark {
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
`;

export default ({ node }) => (
  <Container>
    <Title>
      <Link to={routes.dynamic.blogPost.getPath(node.fields.slug)}>
        {node.frontmatter.title}
      </Link>
    </Title>

    <MetadataContainer>
      <span>
        <Icon path={mdiCalendar} />
        {` `}
        {node.frontmatter.date}
      </span>

      <span>
        <Icon path={mdiClockOutline} />
        {` `}
        {humanizeTimeToRead(node.timeToRead)}
      </span>
    </MetadataContainer>

    <Excerpt>
      {node.excerpt}
      {` `}
      <Link to={routes.dynamic.blogPost.getPath(node.fields.slug)}>
        continue reading
      </Link>
    </Excerpt>
  </Container>
);
