import Code from '@/components/code';
import Emoji from '@/components/emoji';
import Heading from '@/components/heading';
import Inline from '@/components/inline';
import Link from '@/components/link';
import List from '@/components/list';
import ListItem from '@/components/listItem';
import Meta from '@/components/meta';
import Paragraph from '@/components/paragraph';
import c from 'classnames';
import { NextPage } from 'next';

const UkrainePage: NextPage = () => {
  return (
    <>
      <Meta title="Support Ukraine" />

      <section>
        <Heading>Support Ukraine</Heading>

        <div>
          <div className={c('h-10', 'bg-blue-500')} />
          <div className={c('h-10', 'bg-yellow-400')} />
        </div>

        <Paragraph>My name is Oleksii, I&apos;m a software developer from Kyiv, Ukraine.</Paragraph>
        <Paragraph>
          On{' '}
          <Link href="https://twitter.com/Tyrrrz/status/1496665421277184000">
            24th of February 2022
          </Link>{' '}
          I woke up to war:{' '}
          <span className={c('font-semibold')}>
            <Link href="https://war.ukraine.ua">Russian armed forces have invaded my country</Link>
          </span>
          . Driven by chauvinistic ideals and determination to eradicate the Ukrainian people, this
          act of aggression can only be described as{' '}
          <span className={c('font-semibold')}>genocide</span>.
        </Paragraph>
        <Paragraph>
          Russian soldiers spare no thought when bombing residential areas, hospitals, schools,
          museums, cultural heritages, and civilian infrastructure. The{' '}
          <Link href="https://newdirection.online/ukraine-monitoring/article/crimes_in_ukraine_committed_by_the_russian_federation">
            list of committed war crimes
          </Link>{' '}
          grows longer by the minute, while the rest of the world largely remains passive.
        </Paragraph>
        <Paragraph>
          Be on the right side of history!{' '}
          <span className={c('font-semibold')}>Today it&apos;s us, tomorrow it could be you</span>.
        </Paragraph>
      </section>

      <section>
        <Heading variant="h2">Help financially</Heading>

        <Paragraph>
          Please consider helping Ukraine fight back by donating to local charitable funds. Avoid
          donating to global funds such as Red Cross, UNCR, or other non-UA based NGOs — their
          support is ineffective.
        </Paragraph>

        <List>
          <ListItem>
            <Link href="https://u24.gov.ua">Official government donation page</Link>
          </ListItem>
          <ListItem>
            <Link href="https://savelife.in.ua/en/donate-en">NGO &quot;Come Back Alive&quot;</Link>{' '}
            (military aid)
          </ListItem>
          <ListItem>
            <Link href="https://prytulafoundation.org/en/home/support_page">
              NGO &quot;Serhiy Prytula Foundation&quot;
            </Link>{' '}
            (military & humanitarian aid)
          </ListItem>
          <ListItem>
            <Link href="https://koloua.com/en/donate">NGO &quot;Kolo&quot;</Link> (military aid)
          </ListItem>
          <ListItem>
            <Link href="https://hospitallers.life/needs-hospitallers">
              NGO &quot;Hospitallers&quot;
            </Link>{' '}
            (medical aid)
          </ListItem>
          <ListItem>
            <Link href="https://voices.org.ua/en/donat">NGO &quot;Voices of Children&quot;</Link>{' '}
            (humanitarian aid)
          </ListItem>
          <ListItem>
            Any <Link href="/donate">personal donations</Link> during this time will also be
            directed to local charities at my own discretion
          </ListItem>
        </List>
      </section>

      <section>
        <Heading variant="h2">Help in other ways</Heading>

        <Paragraph>If you don&apos;t have the means to help financially, you can also:</Paragraph>

        <List>
          <ListItem>Spread the information about the war throughout your local networks</ListItem>
          <ListItem>
            Avoid products made in Russia (bar codes starting with <Code>460</Code>-<Code>469</Code>
            )
          </ListItem>
          <ListItem>
            Urge your employer to implement sanctions against Russia, or help in other ways
          </ListItem>
          <ListItem>
            Ask your politicians to provide stronger support to Ukraine, including heavy weapons
          </ListItem>
          <ListItem>
            Join your local demonstrations and protests to empower Ukrainian voices
          </ListItem>
          <ListItem>
            <Link href="https://fightforua.org">
              Enlist in the Ukrainian military as a foreign fighter
            </Link>
          </ListItem>
        </List>
      </section>

      <div className={c('my-6', 'text-xl', 'text-center', 'font-light')}>
        <Inline>
          <span>Glory to Ukraine! Glory to Heroes!</span>
          <Emoji code="🇺🇦" />
        </Inline>
      </div>
    </>
  );
};

export default UkrainePage;
