import React from 'react';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Emoji from './components/Emoji';
import Link from './components/Link';
import Page from './components/Page';
import './Home.css';

const HomePage: React.FC = () => {
  return (
    <Page>
      <figure className="avatar">
        <img
          style={{ borderRadius: '1em' }}
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/2560px-Flag_of_Ukraine.svg.png"
          width="200"
          height="120"
        />
      </figure>

      <div>
        <p>My name is Oleksii, I&apos;m a software developer from Kyiv, Ukraine.</p>
        <p>
          On 24th of February 2022 I woke up to war:{' '}
          <strong>
            <Link href="https://war.ukraine.ua">Russian armed forces have invaded my country</Link>
          </strong>
          . Driven by chauvinistic ideals and determination to eradicate the Ukrainian people, this
          act of aggression can only be described as <strong>genocide</strong>.
        </p>
        <p>
          Russian soldiers spare no thought when bombing residential areas, hospitals, schools,
          museums, cultural heritages, and civilian infrastructure. The list of{' '}
          <Link href="https://en.wikipedia.org/wiki/War_crimes_during_the_2022_Russian_invasion_of_Ukraine">
            committed war crimes
          </Link>{' '}
          grows longer by the minute, while the rest of the world largely remains passive.
        </p>
        <p>
          Be on the right side of history!{' '}
          <strong>Today it&apos;s us, tomorrow it could be you</strong>.
        </p>
        <p>
          Please consider helping Ukraine fight back by donating to local charitable funds. Avoid
          donating to global funds such as Red Cross, UNCR, or other non-UA based NGOs — their
          support is ineffective.
        </p>
        <ul>
          <li>
            <Link href="https://u24.gov.ua">Official government donation page</Link>
          </li>

          <li>
            <Link href="https://comebackalive.in.ua/en/donate">
              NPO &quot;Come Back Alive&quot; (military aid)
            </Link>
          </li>
          <li>
            <Link href="https://prytulafoundation.org/en/home/support_page">
              NPO &quot;Serhiy Prytula Foundation&quot; (military &amp; humanitarian aid)
            </Link>
          </li>
          <li>
            <Link href="https://hospitallers.life/needs-hospitallers">
              Hospitallers Battalion (front-line medical assistance)
            </Link>
          </li>
          <li>
            <Link href="https://merch4ukraine.org">
              Merch4Ukraine (my own merch store; proceeds go to smaller local charities)
            </Link>
          </li>
          <li>
            Any <Link href="/donate">personal donations</Link> during this time will also be
            directed to local charities at my own discretion
          </li>
        </ul>
        <p>If you don&apos;t have the means to help financially, you can:</p>
        <ul>
          <li>Spread the information about the war throughout your local networks</li>
          <li>Help out Ukrainian refugees in your area</li>
          <li>Stop buying products made in Russia (bar codes starting with 460-469)</li>
          <li>Urge your employer to take a stance against Russia</li>
          <li>Call your politicans to action</li>
          <li>Protest on the streets</li>
          <li>
            <Link href="https://fightforua.org">Join Ukrainian military as a foreigner</Link>
          </li>
        </ul>
      </div>

      <hr />

      <div style={{ textAlign: 'center' }}>
        <strong>
          <Emoji code="🇺🇦" /> GLORY TO UKRAINE! GLORY TO HEROES!
        </strong>
      </div>

      <hr />

      <div className="social-links">
        <Link className="social-link" href="https://github.com/Tyrrrz">
          <FiGithub strokeWidth={1} />
        </Link>
        <Link className="social-link" href="https://twitter.com/Tyrrrz">
          <FiTwitter strokeWidth={1} />
        </Link>
        <Link className="social-link" href="https://linkedin.com/in/Tyrrrz">
          <FiLinkedin strokeWidth={1} />
        </Link>
      </div>
    </Page>
  );
};

export default HomePage;
