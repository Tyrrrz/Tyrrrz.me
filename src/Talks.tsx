import { compareDesc as compareDatesDesc, format as formatDate } from 'date-fns';
import { graphql } from 'gatsby';
import React from 'react';
import { FiCalendar, FiGlobe, FiMessageCircle } from 'react-icons/fi';
import Link from './shared/Link';
import Page from './shared/Page';

export const query = graphql`
  query {
    allTalksJson {
      nodes {
        title
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

interface TalksPageProps {
  data: { allTalksJson: GatsbyTypes.TalksJsonConnection };
}

export default function TalksPage({ data }: TalksPageProps) {
  const talks = [...data.allTalksJson.nodes]
    .map((node) => ({
      title: node.title!,
      event: node.event!,
      date: new Date(node.date!),
      language: node.language!,
      eventUrl: node.eventUrl!,
      presentationUrl: node.presentationUrl,
      recordingUrl: node.recordingUrl
    }))
    .sort((a, b) => compareDatesDesc(a.date, b.date));

  const years = [...new Set(talks.map((talk) => talk.date.getFullYear()))];

  const talksByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      talks: talks.filter((talk) => talk.date.getFullYear() === year)
    }));

  return (
    <Page title="Talks">
      <div className="section-header">Talks</div>

      {talksByYear.map(({ year, talks }) => (
        <div key={year} className="group">
          <div className="group-header">
            <div>{year}</div>
            <hr className="group-header-line" />
          </div>

          {talks.map((talk) => (
            <div key={talk.event + talk.date} className="entry">
              <div className="entry-name">
                <Link href={talk.recordingUrl || talk.presentationUrl || talk.eventUrl || '#'}>
                  {talk.title}
                </Link>
              </div>

              <div className="entry-info">
                <div className="label">
                  <FiGlobe strokeWidth={1} />
                  <div>
                    <Link href={talk.eventUrl}>{talk.event}</Link>
                  </div>
                </div>

                <div className="label">
                  <FiCalendar strokeWidth={1} />
                  <div>{formatDate(talk.date, 'dd MMM yyyy')}</div>
                </div>

                <div className="label">
                  <FiMessageCircle strokeWidth={1} />
                  <div>{talk.language}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Page>
  );
}
