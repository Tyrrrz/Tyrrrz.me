import { compareDesc as compareDatesDesc, format as formatDate } from 'date-fns';
import { graphql } from 'gatsby';
import React from 'react';
import { FiCalendar, FiGlobe, FiMessageCircle, FiMic, FiRadio, FiTool } from 'react-icons/fi';
import Link from './components/Link';
import Page from './components/Page';

interface SpeakingPageProps {
  data: {
    speakingEngagements: GatsbyTypes.SpeakingJsonConnection;
  };
}

const SpeakingPage: React.FC<SpeakingPageProps> = ({ data }) => {
  const speakingEngagements = data.speakingEngagements.nodes
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

  const years = [
    ...new Set(speakingEngagements.map((engagement) => engagement.date.getFullYear()))
  ];

  const speakingEngagementsByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      engagements: speakingEngagements.filter(
        (engagement) => engagement.date.getFullYear() === year
      )
    }));

  return (
    <Page title="Speaking">
      <div className="section-header">Speaking</div>

      {speakingEngagementsByYear.map(({ year, engagements }) => (
        <div key={year} className="group">
          <div className="group-header">{year}</div>

          {engagements.map((engagement) => (
            <div key={engagement.event + engagement.date} className="entry">
              <div className="entry-name">
                <Link
                  href={
                    engagement.recordingUrl ||
                    engagement.presentationUrl ||
                    engagement.eventUrl ||
                    '#'
                  }
                >
                  {engagement.title}
                </Link>
              </div>

              <div className="entry-info">
                <div className="label">
                  {{
                    Talk: <FiMic strokeWidth={1} />,
                    Workshop: <FiTool strokeWidth={1} />,
                    Podcast: <FiRadio strokeWidth={1} />
                  }[engagement.kind] || <FiMic strokeWidth={1} />}
                  <div>{engagement.kind}</div>
                </div>

                <div className="label">
                  <FiGlobe strokeWidth={1} />
                  <div>
                    <Link href={engagement.eventUrl}>{engagement.event}</Link>
                  </div>
                </div>

                <div className="label">
                  <FiCalendar strokeWidth={1} />
                  <div>{formatDate(engagement.date, 'dd MMM yyyy')}</div>
                </div>

                <div className="label">
                  <FiMessageCircle strokeWidth={1} />
                  <div>{engagement.language}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Page>
  );
};

export const query = graphql`
  query {
    speakingEngagements: allSpeakingJson {
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

export default SpeakingPage;
