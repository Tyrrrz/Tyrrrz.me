import c from 'classnames';
import { NextPage } from 'next';
import Codeblock from '../components/codeblock';
import Emoji from '../components/emoji';
import Heading from '../components/heading';
import Image from '../components/image';
import Inline from '../components/inline';
import Link from '../components/link';
import List from '../components/list';
import ListItem from '../components/listItem';
import Meta from '../components/meta';
import Page from '../components/page';

const UkrainePage: NextPage = () => {
  return (
    <Page>
      <Meta title="Support Ukraine" />
      <Heading>Support Ukraine</Heading>

      <article className={c('space-y-2')}>
        <div className={c('text-center')}>
          <Image src="/ukraine-flag.png" alt="Flag of Ukraine" width={200} height={120} priority />
        </div>

        <p>My name is Oleksii, I&apos;m a software developer from Kyiv, Ukraine.</p>

        <p>
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
        </p>

        <p>
          Russian soldiers spare no thought when bombing residential areas, hospitals, schools,
          museums, cultural heritages, and civilian infrastructure. The{' '}
          <Link href="https://newdirection.online/ukraine-monitoring/article/crimes_in_ukraine_committed_by_the_russian_federation">
            list of committed war crimes
          </Link>{' '}
          grows longer by the minute, while the rest of the world largely remains passive.
        </p>

        <p>
          Be on the right side of history!{' '}
          <span className={c('font-semibold')}>Today it&apos;s us, tomorrow it could be you</span>.
        </p>

        <Heading variant="h2">Help financially</Heading>

        <p>
          Please consider helping Ukraine fight back by donating to local charitable funds. Avoid
          donating to global funds such as Red Cross, UNCR, or other non-UA based NGOs — their
          support is ineffective.
        </p>

        <List>
          <ListItem>
            <Link href="https://u24.gov.ua">Official government donation page</Link>
          </ListItem>
          <ListItem>
            <Link href="https://savelife.in.ua/en/donate-en">
              NGO &quot;Come Back Alive&quot; (military aid)
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://prytulafoundation.org/en/home/support_page">
              NGO &quot;Serhiy Prytula Foundation&quot; (military & humanitarian aid)
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://hospitallers.life/needs-hospitallers">
              Hospitallers Battalion (front-line medical assistance)
            </Link>
          </ListItem>
          <ListItem>
            Any <Link href="/donate">personal donations</Link> during this time will also be
            directed to local charities at my own discretion
          </ListItem>
        </List>

        <Heading variant="h2">Help in other ways</Heading>

        <p>If you don&apos;t have the means to help financially, you can also:</p>

        <List>
          <ListItem>Spread the information about the war throughout your local networks</ListItem>
          <ListItem>
            Avoid products made in Russia (bar codes starting with <Codeblock>460</Codeblock>-
            <Codeblock>469</Codeblock>)
          </ListItem>
          <ListItem>
            Urge your employer to implement sanctions against Russia, help Ukrainian customers, or
            donate to charitable funds
          </ListItem>
          <ListItem>
            Ask your politicians to provide stronger support to Ukraine, including by selling or
            donating more heavy weapons
          </ListItem>
          <ListItem>
            Join your local demonstrations and protests to empower Ukrainian voices
          </ListItem>
          <ListItem>
            <Link href="https://fightforua.org/">
              Enlist in the Ukrainian military as a foreign fighter
            </Link>
          </ListItem>
        </List>

        <div className={c('py-2', 'text-lg', 'font-semibold')}>
          <Inline>
            <span>Glory to Ukraine! Glory to Heroes!</span>
            <Emoji code="🇺🇦" />
          </Inline>
        </div>
      </article>
    </Page>
  );
};

export default UkrainePage;
