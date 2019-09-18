import React from 'react';
import styled from '@emotion/styled';
import { graphql } from 'gatsby';
import Icon from '@mdi/react';
import { mdiStar, mdiCheckboxBlankCircle } from '@mdi/js';

import theme from '../theme';

const Container = styled.div`
  &:not(:last-child) {
    margin-bottom: 1.5em;
  }
`;

const Name = styled.div`
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

const Description = styled.div`
  margin-top: 0.3em;
`;

export default ({ node }) => (
  <Container>
    <Name>
      <a href={node.url}>{node.name}</a>
    </Name>
    <MetadataContainer>
      <span>
        <Icon path={mdiStar} color={theme.accentColor} />
        {` `}
        {node.stargazers.totalCount}
      </span>

      <span>
        <Icon
          path={mdiCheckboxBlankCircle}
          color={node.primaryLanguage.color}
        />
        {` `}
        {node.primaryLanguage.name}
      </span>
    </MetadataContainer>
    <Description>{node.description}</Description>
  </Container>
);

export const query = graphql`
  fragment ProjectListingFragment on GithubUserRepositoriesNodes {
    url
    name
    description
    usesCustomOpenGraphImage
    openGraphImageUrl
    primaryLanguage {
      name
      color
    }
    stargazers {
      totalCount
    }
    isArchived
    isPrivate
    isDisabled
    isLocked
    isMirror
  }
`;
