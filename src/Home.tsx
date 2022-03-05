import React from 'react';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import './Home.css';
import Emoji from './shared/Emoji';
import Link from './shared/Link';
import Page from './shared/Page';

export default function HomePage() {
  return (
    <Page>
      <figure className="avatar">
        <img style={{ borderRadius: '1em' }} src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/2560px-Flag_of_Ukraine.svg.png" width="200" height="120" />
      </figure>

      <hr />

      <div>
        <p>
          My name is Oleksii, I'm a software developer from Kyiv, Ukraine.          
        </p>
        <p>
          Last week, on 24th of February 2022, I woke up to a war. <strong><Link href="https://en.wikipedia.org/wiki/2022_Russian_invasion_of_Ukraine">Russian armed forces have invaded my country</Link></strong>.
          Driven by their leader's determination to eradicate the Ukrainian people, this act of aggression can only be described as <strong>genocide</strong>.
        </p>
        <p>
          Russian soldiers spare no thought when bombing residental areas, hospitals, schools, museums, cultural heritages, and civilian infrastructure.
          The list of <Link href="https://en.wikipedia.org/wiki/War_crimes_during_the_2022_Russian_invasion_of_Ukraine">committed warcrimes</Link> grows longer by the minute, while the rest of the world largely remains passive.
        </p>
        <p>
          Be on the right side of history! <strong>Today it's us, tomorrow it could be you</strong>.
        </p>
        <p>
          Please consider helping Ukraine fight back by donating to our military and various humanitarian causes:
          
          <ul>
            <li><Link href="https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi">Official military donation page</Link></li>
            <li><Link href="https://savelife.in.ua/en/donate">NPO "Come Back Alive" (non-lethal military equipment)</Link></li>
            <li><Link href="https://novaukraine.org/donate">NPO "Nova Ukraine" (humanitarian relief)</Link></li>
            <li><Link href="https://razomforukraine.org/donate">NPO "Razom for Ukraine" (humanitarian relief)</Link></li>
            <li>Any <Link href="/donate">personal donations</Link> during this time will also be routed to support the country</li>
          </ul>
        </p>
        <p>
          If you don't have the means to help financially, you can:

          <ul>
            <li>Spread the information about the war throughout your local networks</li>
            <li>Help local Ukrainian refugees with food, water, medication, supplies, housing, etc.</li>
            <li>Stop buying products made in Russia (barcodes starting with 460-469)</li>
            <li>Urge your employer to take a stance against Russia</li>
            <li>Call your politicans to action</li>
            <li>Protest on the streets</li>
          </ul>

          U.S. citizens can use <Link href="https://docs.google.com/document/d/1V2iMwRNEcS7zL5eNwbOeFZXFQiDBykfx93QaxRSrJlw/edit?usp=sharing">this template</Link> to contact their representatives.
        </p>
      </div>

      <hr />

      <div style={{ textAlign: 'center' }}><strong><Emoji code="🇺🇦" /> GLORY TO UKRAINE! GLORY TO HEROES!</strong></div>

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
}
