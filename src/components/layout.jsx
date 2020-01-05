import React from 'react';
import { Global, css } from '@emotion/core';
import emotionNormalize from 'emotion-normalize';
import theme from '../theme';
import Header from './header';

export default ({ children }) => {
  const normalize = css`
    ${emotionNormalize}
  `;

  const globalStyles = {
    html: {
      color: theme.textColor,
      fontFamily: "'Maven Pro', 'Tahoma', 'Arial', sans-serif",
      fontSize: '20px',
      wordWrap: 'break-word',

      '@media only screen and (max-width: 640px)': {
        fontsize: '18px'
      }
    },
    a: {
      color: 'inherit',
      textDecorationColor: theme.dimColor,

      ':hover': {
        color: theme.accentColor,
        textDecorationColor: 'initial'
      }
    }
  };

  return (
    <>
      <Global styles={[normalize, globalStyles]} />

      <Header />

      <main
        css={{
          maxWidth: '1000px',
          margin: '0 auto 2em auto',
          padding: '1em'
        }}>
        {children}
      </main>
    </>
  );
};
