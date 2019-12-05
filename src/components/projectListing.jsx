import React from 'react';
import { graphql } from 'gatsby';

import { OutboundLink } from 'gatsby-plugin-google-analytics'

import styled from '@emotion/styled';
import MdiIcon from '@mdi/react';
import { mdiStar, mdiCodeTags } from '@mdi/js';

import theme from '../theme';

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

const Name = styled.div`
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

const Description = styled.div`
  margin-top: 0.3em;
`;

export const query = graphql`
  fragment ProjectListingFragment on ProjectsJson {
    name
    url
    description
    stars
    language
  }
`;

export default ({ node }) => (
  <Container>
    <Name>
      <OutboundLink href={node.url}>{node.name}</OutboundLink>
    </Name>

    <MetadataContainer>
      <span>
        <Icon path={mdiStar} color={theme.accentColor} />
        {` `}
        {node.stars}
      </span>

      <span>
        <Icon path={mdiCodeTags} />
        {` `}
        {node.language}
      </span>
    </MetadataContainer>

    <Description>{node.description}</Description>
  </Container>
);
