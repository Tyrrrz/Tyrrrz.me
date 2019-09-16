import React from 'react';
import styled from '@emotion/styled';
import { graphql, Link } from 'gatsby';
import Icon from '@mdi/react';
import { mdiCalendar, mdiClockOutline } from '@mdi/js';

import { dynamicRoutes } from '../routes';

import moment from 'moment';

const Container = styled.div`
  &:not(:last-child) {
    margin-bottom: 1.5em;
  }
`;

const Title = styled.div`
  font-size: 1.5em;
`;

const MetadataContainer = styled.div`
  margin-top: 0.3em;
  opacity: 0.65;
  font-size: 0.8em;

  svg {
    margin-top: 0.06em;
    vertical-align: top;
    width: 1em;
  }

  span + span {
    margin-left: 1em;
  }
`;

const Excerpt = styled.div`
  margin-top: 0.3em;

  a {
    font-weight: 600;
  }
`;

export const BlogPostListing = ({ node }) => {
  return (
    <Container>
      <Title>
        <Link to={dynamicRoutes.blogPost.getPath(node.fields.slug)}>
          {node.frontmatter.title}
        </Link>
      </Title>

      <MetadataContainer>
        <span>
          <Icon path={mdiCalendar} /> {node.frontmatter.date}
        </span>

        <span>
          <Icon path={mdiClockOutline} />{' '}
          {moment.duration(node.timeToRead, 'minutes').humanize()} to read
        </span>
      </MetadataContainer>

      <Excerpt>
        {node.excerpt}{' '}
        <Link to={dynamicRoutes.blogPost.getPath(node.fields.slug)}>
          continue reading
        </Link>
      </Excerpt>
    </Container>
  );
};

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
