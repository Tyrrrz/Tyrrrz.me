import { compareDesc as compareDatesDesc, format as formatDate } from 'date-fns';
import { graphql } from 'gatsby';
import React from 'react';
import { FiCalendar, FiGlobe, FiMessageCircle, FiMic, FiRadio, FiTool } from 'react-icons/fi';
import Link from './shared/Link';
import Page from './shared/Page';

export const query = graphql`
  query {
    allSpeakingJson {
      nodes {
        title
        kind
        event
        date
        language
        eventUrl
        presentationUrl
        recordingUrl
      }
    }
  }
`;

interface SpeakingPageProps {
  data: { allSpeakingJson: GatsbyTypes.SpeakingJsonConnection };
}

export default function SpeakingPage({ data }: SpeakingPageProps) {
  const speakingEngagements = [...data.allSpeakingJson.nodes]
    .map((node) => ({
      title: node.title!,
      kind: node.kind!,
      event: node.event!,
      date: new Date(node.date!),
      language: node.language!,
      eventUrl: node.eventUrl!,
      presentationUrl: node.presentationUrl,
      recordingUrl: node.recordingUrl
    }))
    .sort((a, b) => compareDatesDesc(a.date, b.date));

  const years = [...new Set(speakingEngagements.map((e) => e.date.getFullYear()))];

  const speakingEngagementsByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      engagements: speakingEngagements.filter((e) => e.date.getFullYear() === year)
    }));

  return (
    <Page title="Speaking">
      <div className="section-header">Speaking</div>

      {speakingEngagementsByYear.map(({ year, engagements }) => (
        <div key={year} className="group">
          <div className="group-header">
            <div>{year}</div>
            <hr className="group-header-line" />
          </div>

          {engagements.map((e) => (
            <div key={e.event + e.date} className="entry">
              <div className="entry-name">
                <Link href={e.recordingUrl || e.presentationUrl || e.eventUrl || '#'}>
                  {e.title}
                </Link>
              </div>

              <div className="entry-info">
                <div className="label">
                  {{
                    Talk: <FiMic strokeWidth={1} />,
                    Workshop: <FiTool strokeWidth={1} />,
                    Podcast: <FiRadio strokeWidth={1} />
                  }[e.kind] || <FiMic strokeWidth={1} />}
                  <div>{e.kind}</div>
                </div>

                <div className="label">
                  <FiGlobe strokeWidth={1} />
                  <div>
                    <Link href={e.eventUrl}>{e.event}</Link>
                  </div>
                </div>

                <div className="label">
                  <FiCalendar strokeWidth={1} />
                  <div>{formatDate(e.date, 'dd MMM yyyy')}</div>
                </div>

                <div className="label">
                  <FiMessageCircle strokeWidth={1} />
                  <div>{e.language}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Page>
  );
}
