import React from 'react';
import { Link } from 'gatsby';
import theme from '../theme';
import routes from '../routes';
import useSiteMetadata from './hooks/useSiteMetadata';

export default () => {
  const siteMetadata = useSiteMetadata();

  const MenuLink = ({ name, ...props }) => (
    <Link
      activeStyle={{ borderColor: theme.accentColor }}
      css={{
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderWidth: '0 0 2px 0',
        textDecoration: 'none',

        ':hover': {
          color: theme.accent
        },

        '&:not(:last-child)': {
          marginRight: '0.4em'
        }
      }}
      {...props}>
      {name}
    </Link>
  );

  return (
    <header
      css={{
        padding: '0.3em 0',
        backgroundColor: theme.mainColor,
        color: theme.inverseTextColor
      }}>
      <div
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
        }}>
        {/* Title */}
        <div
          css={{
            gridArea: 'title',
            fontSize: '2.3em'
          }}>
          <Link to={routes.static.home.path} css={{ textDecoration: 'none' }}>
            {siteMetadata.title}
          </Link>
        </div>

        {/* Menu */}
        <div
          css={{
            gridArea: 'menu',
            fontSize: '1.3em'
          }}>
          <MenuLink name={'home'} to={routes.static.home.path} partiallyActive={false} />
          <MenuLink name={'projects'} to={routes.static.projects.path} partiallyActive={true} />
          <MenuLink name={'blog'} to={routes.static.blog.path} partiallyActive={true} />
          <MenuLink name={'talks'} to={routes.static.talks.path} partiallyActive={true} />
        </div>
      </div>
    </header>
  );
};
