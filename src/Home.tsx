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
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/2560px-Flag_of_Ukraine.svg.png" width="200" height="120" />
      </figure>

      <hr />

      <div>
        <p>
          <Emoji code="⚠" /> My name is Oleksii, I'm a software developer from Kyiv, Ukraine.
          Right this moment, <strong><Link href="https://en.wikipedia.org/wiki/2022_Russian_invasion_of_Ukraine">my country is under continuous attack by armed forces of Russia</Link></strong> in an act of war that can only be described as <strong>genocide of Ukranian people</strong>!
        </p>
        <p>
          Russian soldiers spare no thought when bombing residental areas, hospitals, schools, museums, cultural heritages, and civilian infrastructure.
          The list of <Link href="https://en.wikipedia.org/wiki/War_crimes_during_the_2022_Russian_invasion_of_Ukraine">committed warcrimes</Link> only gets longer while the rest of the world largely remains passive.
        </p>
        <p>
          Please consider helping Ukraine fight back by suporting our military and by donating to humanitarian causes:
          
          <ul>
            <li><Link href="https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi">Official Donation Fund for UA Military</Link></li>
            <li><Link href="https://savelife.in.ua/en/donate">NPO "Come Back Alive" (non-lethal military equipment)</Link></li>
            <li><Link href="https://savelife.in.ua/en/donate">NPO "Nova Ukraine" (humanitarian relief)</Link></li>
            <li><Link href="https://donate.unhcr.org/int/en/ukraine-emergency">UNHCR UN Refugee Agency</Link></li>
            <li>Any <Link href="/donate">personal donations</Link> during this time will also be used to support the country</li>
          </ul>
        </p>
        <p>
          If you don't have the means to help financially, consider also to:

          <ul>
            <li>Spread the information about the war throughout your local networks</li>
            <li>Help Ukrainian refugees in your area with food, water, medication, supplies, housing, etc.</li>
            <li><Link href="https://reddit.com/r/poland/comments/t0mr58/stop_buying_russian_products_at_least_thats_what">Stop buying products made in Russia</Link> (barcodes starting with 460-469)</li>
            <li>Call your politicans to action and protest on the streets</li>
          </ul>
        </p>
      </div>

      <hr />

      <div><strong><Emoji code="🇺🇦" /> GLORY TO UKRAINE! GLORY TO HEROES!</strong></div>

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
