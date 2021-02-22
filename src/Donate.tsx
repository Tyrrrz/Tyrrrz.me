import React from 'react';
import Link from './shared/Link';
import Page from './shared/Page';

export default function DonatePage() {
  return (
    <Page title="Donate">
      <h1>Donate</h1>

      <p>
        If you found any of my projects useful and want to support their development, please
        consider making a donation 🙂
      </p>

      <ul>
        <li>
          <Link href="https://patreon.com/Tyrrrz">Patreon</Link> (recurring)
        </li>
        <li>
          <Link href="https://buymeacoffee.com/Tyrrrz">BuyMeACoffee</Link> (one-time)
        </li>
        <li>
          Ethereum: <code>0xE52F3BD5375DB842e20c86f13dE99717929DE730</code>
        </li>
        <li>
          Bitcoin: <code>3HtgWiio8fzMpYTXiZVNrKiQSdXAEf7xet</code>
        </li>
      </ul>

      <p>Top supporters:</p>

      <ul>
        <li>Peter Wesselius</li>
        <li>Mark Ledwich</li>
        <li>Thomas C</li>
        <li>BouncingWalrus</li>
        <li>Dominic Maas</li>
        <li>Victor Smith</li>
        <li>A dude</li>
        <li>Greg Engle</li>
        <li>Samuel Morris</li>
        <li>lupus</li>
        <li>Richard</li>
        <li>Foritus</li>
        <li>Vince</li>
        <li>Michael Dayah</li>
        <li>Sprocketman1981</li>
        <li>Jim Wilson</li>
      </ul>
    </Page>
  );
}
