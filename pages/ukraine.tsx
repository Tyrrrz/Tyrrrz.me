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
            <Link href="https://war.ukraine.ua">Russian Armed Forces have invaded my country</Link>
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
          Luckily, we don&apos;t have to endure this fight in solitude and I&apos;m immensely
          thankful to everyone who supports us! Every bit of help, no matter how big or small,
          brings us closer to victory.
        </Paragraph>
      </section>

      <section>
        <Heading variant="h2">How to help financially</Heading>

        <Paragraph>
          When it comes to financial aid, the most effective thing you can do is donate to one of
          the local non-government charities that supply our defenders with critical equipment —
          power stations, medical supplies, armored vests, light vehicles, reconnaissance drones,
          weapon attachments, etc. It&apos;s best to avoid donating to global funds, such as Red
          Cross or UN Crisis Relief, because they have very limited presence in Ukraine and
          typically can&apos;t provide the most necessary support.
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
            <Link href="https://prytulafoundation.org/en/home/support_page?source=tyrrrz">
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
            <Link href="https://voices.org.ua/en/donat?source=tyrrrz">
              <span className={c('font-semibold')}>Voices of Children</span> Foundation
            </Link>{' '}
            (humanitarian aid)
          </ListItem>
          <ListItem>
            <Link href="https://u24.gov.ua">Government donation portal</Link> (humanitarian aid)
          </ListItem>
          <ListItem>
            <Link href="/donate">Personal donations to me</Link> are also directed to local
            charities at my own discretion
          </ListItem>
        </List>
      </section>

      <section>
        <Heading variant="h2">Other ways to help</Heading>

        <Paragraph>
          If you don&apos;t have the means to help financially, there are also other things you can
          do:
        </Paragraph>

        <List>
          <ListItem>
            Donate unused clothes, medical supplies, tools & equipment to refugee centers or
            Ukrainian charities
          </ListItem>
          <ListItem>Reach out to Ukrainian friends or colleagues, offer them help</ListItem>
          <ListItem>
            <Link href="https://www.ethicalconsumer.org/ethicalcampaigns/boycotts/should-we-boycott-russia">
              Avoid physical products made in Russia
            </Link>{' '}
            (bar codes starting with <Code>460</Code>-<Code>469</Code>)
          </ListItem>
          <ListItem>
            <Link href="https://stand-with-ukraine.pp.ua/Boycott.html">
              Avoid software products made in Russia
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://boycottrussia.info/list-of-shame">
              Boycott international companies that continue operating in Russia
            </Link>
          </ListItem>
          <ListItem>
            Ask your employer to implement sanctions against Russia, or help in other ways
          </ListItem>
          <ListItem>
            Ask your politicians to provide stronger support to Ukraine, including heavy weapons
          </ListItem>
          <ListItem>Join your local protests to empower Ukrainian voices</ListItem>
          <ListItem>Spread the word about the war in your local networks</ListItem>
          <ListItem>
            <Link href="https://spellingukraine.com">
              Use the correct transliteration when referring to Ukrainian toponyms
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://fightforua.org">
              Enlist in the Ukrainian military as a foreign fighter
            </Link>
          </ListItem>
        </List>
      </section>

      <div className={c('my-6', 'text-xl', 'text-center', 'font-light')}>
        <span>Glory to Ukraine! Glory to Heroes!</span>
      </div>
    </>
  );
};

export default UkrainePage;
