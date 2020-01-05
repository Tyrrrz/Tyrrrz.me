import React from 'react';
import { graphql } from 'gatsby';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import MdiIcon from '@mdi/react';
import { mdiCalendar, mdiTranslate } from '@mdi/js';

export const query = graphql`
  fragment TalkListingFragment on TalksJson {
    title
    description
    event
    date(formatString: "DD MMMM YYYY")
    language
    eventUrl
    presentationUrl
    recordingUrl
  }
`;

export default ({ node }) => {
  const Icon = ({ ...props }) => (
    <MdiIcon
      size={'1em'}
      css={{
        marginTop: '0.06em',
        verticalAlign: 'top'
      }}
      {...props}
    />
  );

  return (
    <div
      css={{
        '&:not(:last-child)': {
          marginBottom: '1.5em'
        }
      }}>
      {/* Title */}
      <div css={{ fontSize: '1.5em' }}>
        <OutboundLink href={node.eventUrl} css={{ textDecoration: 'none' }}>
          {node.title}
        </OutboundLink>
      </div>

      {/* Meta */}
      <div
        css={{
          marginTop: '0.3em',
          opacity: '0.65',
          fontSize: '0.8em',

          'span + span': {
            marginLeft: '1em'
          }
        }}>
        <span>
          <Icon path={mdiCalendar} /> {node.event} ({node.date})
        </span>

        <span>
          <Icon path={mdiTranslate} />
          {` `}
          {node.language}
        </span>
      </div>

      {/* Description */}
      <div css={{ marginTop: '0.3em' }}>{node.description}</div>

      {/* Links */}
      <div
        css={{
          marginTop: '0.3em',

          'a + a': {
            marginLeft: '0.85em'
          }
        }}>
        {node.presentationUrl && <OutboundLink href={node.presentationUrl}>Presentation</OutboundLink>}
        {node.recordingUrl && <OutboundLink href={node.recordingUrl}>Recording</OutboundLink>}
      </div>
    </div>
  );
};
