import { css, Global } from '@emotion/core';
import emotionNormalize from 'emotion-normalize';
import React from 'react';

import routes from '../routes';
import theme from '../theme';
import Link from './shared/Link';
import useSiteMetadata from './shared/useSiteMetadata';

const HeaderLink = ({ name, ...props }) => (
  <Link
    activeStyle={{ borderColor: theme.accentColor }}
    css={{
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderWidth: '0 0 2px 0',
      textDecoration: 'none',

      ':hover': { color: theme.accent },

      '&:not(:last-child)': { marginRight: '0.4em' }
    }}
    {...props}
  >
    {name}
  </Link>
);

const Header = () => {
  const siteMetadata = useSiteMetadata();

  return (
    <header
      css={{
        padding: '0.3em 0',
        backgroundColor: theme.mainColor,
        color: theme.inverseTextColor
      }}
    >
      <nav
        css={{
          display: 'grid',
          maxWidth: '1000px',
          width: '96%',
          minHeight: '70px',
          marginLeft: 'auto',
          marginRight: 'auto',
          gridTemplateColumns: 'auto 1fr auto',
          gridTemplateRows: 'auto',
          gridTemplateAreas: '"title . menu"',
          alignItems: 'center',

          '@media only screen and (max-width: 640px)': {
            display: 'block',
            textAlign: 'center'
          }
        }}
      >
        {/* Title */}
        <div
          css={{
            gridArea: 'title',
            fontSize: '2.3em'
          }}
        >
          <Link to={routes.static.home.path} css={{ textDecoration: 'none' }}>
            {siteMetadata.title}
          </Link>
        </div>

        {/* Menu */}
        <div
          css={{
            gridArea: 'menu',
            fontSize: '1.3em'
          }}
        >
          <HeaderLink name="home" to={routes.static.home.path} partiallyActive={false} />
          <HeaderLink name="projects" to={routes.static.projects.path} partiallyActive />
          <HeaderLink name="blog" to={routes.static.blog.path} partiallyActive />
          <HeaderLink name="talks" to={routes.static.talks.path} partiallyActive />
        </div>
      </nav>
    </header>
  );
};

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

      '@media only screen and (max-width: 640px)': { fontsize: '18px' }
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
        }}
      >
        {children}
      </main>
    </>
  );
};
