import { mdiCalendar, mdiTranslate } from '@mdi/js';
import { graphql } from 'gatsby';
import React from 'react';

import Layout from './Layout';
import Icon from './shared/Icon';
import Link from './shared/Link';
import Meta from './shared/Meta';

export const query = graphql`
  query {
    allTalksJson(sort: { fields: date, order: DESC }) {
      nodes {
        title
        description
        event
        date(formatString: "DD MMMM YYYY")
        language
        eventUrl
        presentationUrl
        recordingUrl
      }
    }
  }
`;

const TalkListing = ({ node }) => {
  const title = node.title;
  const description = node.description;
  const event = node.event;
  const date = node.date;
  const language = node.language;
  const eventUrl = node.eventUrl;
  const presentationUrl = node.presentationUrl;
  const recordingUrl = node.recordingUrl;
  const mainUrl = recordingUrl || presentationUrl || eventUrl || '#';

  return (
    <div css={{ '&:not(:last-child)': { marginBottom: '1.5em' } }}>
      {/* Title */}
      <div css={{ fontSize: '1.5em' }}>
        <Link to={mainUrl} css={{ textDecoration: 'none' }}>
          {title}
        </Link>
      </div>

      {/* Meta */}
      <div
        css={{
          marginTop: '0.3em',
          opacity: '0.65',
          fontSize: '0.8em',

          'span + span': { marginLeft: '1em' }
        }}
      >
        <span>
          <Icon path={mdiCalendar} /> {event} ({date})
        </span>

        <span>
          <Icon path={mdiTranslate} /> {language}
        </span>
      </div>

      {/* Description */}
      <div css={{ marginTop: '0.3em' }}>{description}</div>

      {/* Links */}
      <div
        css={{
          marginTop: '0.3em',

          'a + a': { marginLeft: '0.85em' }
        }}
      >
        {eventUrl && <Link to={eventUrl}>Event</Link>}
        {presentationUrl && <Link to={presentationUrl}>Presentation</Link>}
        {recordingUrl && <Link to={recordingUrl}>Recording</Link>}
      </div>
    </div>
  );
};

export default ({ data }) => (
  <Layout>
    <Meta title="Talks" />

    {data.allTalksJson.nodes.map((node) => (
      <TalkListing key={node.title} node={node} />
    ))}
  </Layout>
);
