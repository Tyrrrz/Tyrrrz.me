import Heading from '@/components/heading';
import Inline from '@/components/inline';
import Link from '@/components/link';
import Meta from '@/components/meta';
import Page from '@/components/page';
import Paragraph from '@/components/paragraph';
import Timeline from '@/components/timeline';
import TimelineItem from '@/components/timelineItem';
import { loadSpeakingEngagements, SpeakingEngagement } from '@/data';
import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { FiCalendar, FiMapPin, FiMessageCircle, FiMic, FiRadio, FiTool } from 'react-icons/fi';

type SpeakingPageProps = {
  engagements: SpeakingEngagement[];
};

const SpeakingPage: NextPage<SpeakingPageProps> = ({ engagements }) => {
  const years = [
    ...new Set(engagements.map((engagement) => new Date(engagement.date).getFullYear()))
  ];

  const groups = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      engagements: engagements.filter(
        (engagement) => new Date(engagement.date).getFullYear() === year
      )
    }));

  return (
    <Page>
      <Meta title="Speaking" />

      <section>
        <Heading>Speaking</Heading>

        <Paragraph>
          These are all the speaking engagements I&apos;ve had in the past, or plan to have in the
          future. Where available, follow the links to see the video recordings. If you want me to
          speak at your event, please contact me on{' '}
          <Link href="https://twitter.com/Tyrrrz">Twitter</Link>.
        </Paragraph>
      </section>

      <section className={c('mt-8', 'space-y-6')}>
        {groups.map(({ year, engagements }, i) => (
          <section key={i}>
            <Heading variant="h2">{year}</Heading>

            <div className={c('ml-4')}>
              <Timeline>
                {engagements.map((engagement, i) => (
                  <TimelineItem key={i}>
                    <div className={c('text-lg')}>
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

                    <div className={c('flex', 'flex-wrap', 'gap-x-3', 'font-light')}>
                      <Inline>
                        <FiCalendar strokeWidth={1} />
                        <span>
                          {new Date(engagement.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </Inline>

                      <Inline>
                        {{
                          Talk: <FiMic strokeWidth={1} />,
                          Workshop: <FiTool strokeWidth={1} />,
                          Podcast: <FiRadio strokeWidth={1} />
                        }[engagement.kind] || <FiMic strokeWidth={1} />}
                        <span>{engagement.kind}</span>
                      </Inline>

                      <Inline>
                        <FiMapPin strokeWidth={1} />
                        <span>
                          <Link href={engagement.eventUrl || '#'}>{engagement.event}</Link>
                        </span>
                      </Inline>

                      <Inline>
                        <FiMessageCircle strokeWidth={1} />
                        <span>{engagement.language}</span>
                      </Inline>
                    </div>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>
          </section>
        ))}
      </section>
    </Page>
  );
};

export const getStaticProps: GetStaticProps<SpeakingPageProps> = async () => {
  const engagements: SpeakingEngagement[] = [];
  for await (const engagement of loadSpeakingEngagements()) {
    engagements.push(engagement);
  }

  engagements.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return {
    props: {
      engagements
    }
  };
};

export default SpeakingPage;
