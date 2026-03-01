import c from 'classnames';
import { NextPage } from 'next';
import Code from '~/components/code';
import Heading from '~/components/heading';
import Link from '~/components/link';
import List from '~/components/list';
import ListItem from '~/components/listItem';
import Meta from '~/components/meta';
import Paragraph from '~/components/paragraph';

const UkrainePage: NextPage = () => {
  return (
    <>
      <Meta title="#StandWithUkraine" />

      <section>
        <Heading>#StandWithUkraine</Heading>

        <div>
          <div className={c('h-10', 'bg-blue-500')} />
          <div className={c('h-10', 'bg-yellow-400')} />
        </div>

        <Paragraph>
          My name is Oleksii, I&apos;m a software developer from Kyiv, Ukraine. On{' '}
          <Link href="https://twitter.com/Tyrrrz/status/1496665421277184000">
            24th of February 2022
          </Link>{' '}
          I woke up to war:{' '}
          <span className={c('font-semibold')}>
            <Link href="https://en.wikipedia.org/wiki/2022_Russian_invasion_of_Ukraine">
              Russian Armed Forces have invaded my country
            </Link>
          </span>
          . Driven by chauvinistic ideals and determination to eradicate the Ukrainian people, this
          act of aggression can only be described as{' '}
          <span className={c('font-semibold')}>genocide</span>.
        </Paragraph>

        <Paragraph>
          Russian soldiers spare no thought when bombing residential areas, hospitals, schools,
          museums, cultural heritages, and civilian infrastructure. The{' '}
          <Link href="https://en.wikipedia.org/wiki/War_crimes_in_the_2022_Russian_invasion_of_Ukraine">
            list of war crimes
          </Link>{' '}
          grows by the minute, while the Russian war machine still enjoys both active and tacit
          public support back home.
        </Paragraph>

        <Paragraph>
          In Ukraine, everyone&apos;s life has been irrecoverably affected. Some of us lost our
          homes, friends, loved ones, while the rest are struggling to maintain a sense of normalcy
          in-between the sounds of sirens and regular blackouts. War is a surreal thing to try to
          comprehend, but unfortunately it&apos;s real and it&apos;s here —{' '}
          <span className={c('font-semibold')}>all we can do is fight back</span>.
        </Paragraph>

        <Paragraph>
          Since early 2026 I have finally left behind my career in software development and joined
          the Armed Forces of Ukraine. It's not clear when this war will end, but it&apos;s clear
          that it won&apos;t end by itself.
        </Paragraph>

        <Paragraph>
          If you are sympathetic to our cause and wish to help, I have compiled a list of funds and
          organizations that I personally trust and recommend donating to. When it comes to
          financial aid, it&apos;s best to avoid large global funds, such as Red Cross or UN Crisis
          Relief, because they have very limited presence in Ukraine and typically can&apos;t
          provide the most necessary support.
        </Paragraph>

        <List>
          <ListItem>
            <Link href="https://dzygaspaw.com/support?source=tyrrrz">
              <span className={c('font-semibold')}>Dzyga&apos;s Paw</span> Foundation
            </Link>{' '}
            (defensive & humanitarian aid)
          </ListItem>

          <ListItem>
            <Link href="https://savelife.in.ua/en/donate-en/?source=tyrrrz">
              <span className={c('font-semibold')}>Come Back Alive</span> Foundation
            </Link>{' '}
            (defensive aid)
          </ListItem>

          <ListItem>
            <Link href="https://prytulafoundation.org/en/home/support_page">
              <span className={c('font-semibold')}>Serhiy Prytula</span> Foundation
            </Link>{' '}
            (defensive & humanitarian aid)
          </ListItem>

          <ListItem>
            <Link href="https://koloua.com/en/donate?source=tyrrrz">
              <span className={c('font-semibold')}>Kolo</span> Foundation
            </Link>{' '}
            (defensive aid)
          </ListItem>

          <ListItem>
            <Link href="https://hospitallers.life/needs-hospitallers?source=tyrrrz">
              <span className={c('font-semibold')}>Hospitallers Battalion</span>
            </Link>{' '}
            (medical aid)
          </ListItem>

          <ListItem>
            <Link href="https://donate.wck.org/give/506339/donation/checkout/donation/checkout?source=tyrrrz">
              <span className={c('font-semibold')}>World Central Kitchen</span>
            </Link>{' '}
            (humanitarian aid)
          </ListItem>

          <ListItem>
            <Link href="/donate">Personal donations to me</Link> are directed to support my own
            needs, including equipment and supplies
          </ListItem>
        </List>
      </section>

      <div className={c('my-6', 'text-xl', 'text-center', 'font-light')}>
        Glory to Ukraine! Glory to Heroes!
      </div>
    </>
  );
};

export default UkrainePage;
