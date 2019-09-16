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

export const Footer = () => (
  <Container>
    <SocialLink href="mailto:tyrrrz@gmail.com">
      <Icon path={mdiAt} />
    </SocialLink>

    <SocialLink href="https://github.com/tyrrrz">
      <Icon path={mdiGithubCircle} />
    </SocialLink>

    <SocialLink href="https://twitter.com/tyrrrz">
      <Icon path={mdiTwitterCircle} />
    </SocialLink>

    <SocialLink href="https://instagram.com/tyrrrz">
      <Icon path={mdiInstagram} />
    </SocialLink>
  </Container>
);
