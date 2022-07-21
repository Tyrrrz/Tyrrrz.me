import { GetStaticProps, NextPage } from 'next';
import { FiCalendar, FiMapPin, FiMessageCircle, FiMic, FiRadio, FiTool } from 'react-icons/fi';
import Box from '../../components/box';
import Header from '../../components/header';
import Link from '../../components/link';
import Meta from '../../components/meta';
import Stack from '../../components/stack';
import Timeline from '../../components/timeline';
import TimelineItem from '../../components/timelineItem';
import { getSpeakingEngagements, SpeakingEngagement } from '../../data';

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
    <>
      <Meta title="Speaking" />
      <Header>Speaking</Header>

      <Box classes={['text-lg']}>
        These are all the speaking engagements I&apos;ve had in the past, or plan to have in the
        future. Where available, follow the links to see the video recordings. If you want me to
        speak at your event, please contact me on{' '}
        <Link href="https://twitter.com/tyrrrz">Twitter</Link>.
      </Box>

      <Box classes={['mt-6', 'space-y-6']}>
        {groups.map(({ year, engagements }, i) => (
          <Box key={i}>
            <Box classes={['my-2', 'text-xl', 'font-semibold']}>{year}</Box>

            <Box classes={['ml-4']}>
              <Timeline>
                {engagements.map((engagement, i) => (
                  <TimelineItem key={i}>
                    <Box classes={['text-lg']}>
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
                    </Box>

                    <Stack orientation="horizontal" wrap gap="large">
                      <Stack orientation="horizontal">
                        <FiCalendar strokeWidth={1} />
                        <Box classes={['font-light']}>
                          {new Date(engagement.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Box>
                      </Stack>

                      <Stack orientation="horizontal">
                        {{
                          Talk: <FiMic strokeWidth={1} />,
                          Workshop: <FiTool strokeWidth={1} />,
                          Podcast: <FiRadio strokeWidth={1} />
                        }[engagement.kind] || <FiMic strokeWidth={1} />}
                        <Box classes={['font-light', 'capitalize']}>{engagement.kind}</Box>
                      </Stack>

                      <Stack orientation="horizontal">
                        <FiMapPin strokeWidth={1} />
                        <Box classes={['font-light']}>
                          <Link href={engagement.eventUrl || '#'}>{engagement.event}</Link>
                        </Box>
                      </Stack>

                      <Stack orientation="horizontal">
                        <FiMessageCircle strokeWidth={1} />
                        <Box classes={['font-light']}>{engagement.language}</Box>
                      </Stack>
                    </Stack>
                  </TimelineItem>
                ))}
              </Timeline>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps<SpeakingPageProps> = async () => {
  const engagements: SpeakingEngagement[] = [];
  for await (const engagement of getSpeakingEngagements()) {
    engagements.push(engagement);
  }

  return {
    props: {
      engagements
    }
  };
};

export default SpeakingPage;
