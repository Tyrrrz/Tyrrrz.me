import React from 'react';

import styled from '@emotion/styled';
import Icon from '@mdi/react';
import {
  mdiAt,
  mdiGithubCircle,
  mdiTwitterCircle,
  mdiInstagram
} from '@mdi/js';

import theme from '../theme';
import useSiteMetadata from './hooks/useSiteMetadata';

const Container = styled.footer`
  margin-top: 2em;
  margin-bottom: 1.5em;
  text-align: center;
`;

const SocialLink = styled.a`
  margin-left: 0.15em;
  margin-right: 0.15em;

  svg {
    width: 1.4em;
  }

  &:hover {
    svg {
      path {
        fill: ${theme.accentColor};
      }
    }
  }
`;

export default () => {
  const siteMetadata = useSiteMetadata();

  return (
    <Container>
      <SocialLink href={`mailto:${siteMetadata.email}`}>
        <Icon path={mdiAt} />
      </SocialLink>

      <SocialLink href={`https://github.com/${siteMetadata.github}`}>
        <Icon path={mdiGithubCircle} />
      </SocialLink>

      <SocialLink href={`https://twitter.com/${siteMetadata.twitter}`}>
        <Icon path={mdiTwitterCircle} />
      </SocialLink>

      <SocialLink href={`https://instagram.com/${siteMetadata.instagram}`}>
        <Icon path={mdiInstagram} />
      </SocialLink>
    </Container>
  );
};
