import React from 'react';
import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import emotionNormalize from 'emotion-normalize';

import theme from '../theme';
import { Header } from './header';
import { Footer } from './footer';

const GlobalStyle = css`
  ${emotionNormalize}

  html {
    color: ${theme.textColor};
    font-family: 'Maven Pro';
    font-size: 20px;
    word-wrap: break-word;

    @media only screen and (max-width: 640px) {
      font-size: 18px;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    color: ${theme.accentColor};
    text-decoration: underline;
  }
`;

const Content = styled.main`
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: 1em;
`;

export const Layout = ({ children }) => (
  <>
    <Global styles={GlobalStyle} />

    <Header />
    <Content>{children}</Content>
    <Footer />
  </>
);
