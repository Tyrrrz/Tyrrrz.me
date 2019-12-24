import React from 'react';

import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import emotionNormalize from 'emotion-normalize';

import theme from '../theme';

import Header from './header';
import Footer from './footer';

const GlobalStyle = css`
  ${emotionNormalize}

  html {
    color: ${theme.textColor};
    font-family: 'Maven Pro', 'Tahoma', 'Arial', sans-serif;
    font-size: 20px;
    word-wrap: break-word;

    @media only screen and (max-width: 640px) {
      font-size: 18px;
    }
  }

  a {
    color: inherit;
  }

  a:hover {
    color: ${theme.accentColor};
  }
`;

const Content = styled.main`
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  padding: 1em;
`;

export default ({ children }) => (
  <>
    <Global styles={GlobalStyle} />

    <Header />
    <Content>{children}</Content>
    <Footer />
  </>
);
