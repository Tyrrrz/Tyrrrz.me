import React from 'react';
import Link from './shared/Link';
import Page from './shared/Page';

export default function DonatePage() {
  return (
    <Page title="Donate">
      <div className="section-header">Donate</div>

      <div className="section-prelude">
        If you found any of my projects useful and want to support their development, please
        consider making a donation 🙂
      </div>

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

      <p>💜 Top supporters:</p>

      <ul>
        <li>Peter Wesselius</li>
        <li>Mark Ledwich</li>
        <li>Dominic Maas</li>
        <li>Thomas C</li>
        <li>A dude</li>
        <li>BouncingWalrus</li>
        <li>Greg Engle</li>
        <li>Victor Smith</li>
        <li>KillerGoldFisch</li>
        <li>CCRed95</li>
        <li>Lucid Brot</li>
        <li>Foritus</li>
        <li>lupus</li>
        <li>Meteor Burn</li>
        <li>Vince</li>
        <li>Richard</li>
        <li>Przemyslaw Ryciuk</li>
        <li>Rich Burgess</li>
        <li>eggeggss</li>
        <li>ACPWinitiate</li>
        <li>sathh</li>
        <li>Sprocketman1981</li>
        <li>Dook</li>
        <li>Piotr</li>
        <li>Perry Straw</li>
        <li>Jim Wilson</li>
        <li>VinzNL</li>
        <li>Michael Dayah</li>
        <li>Samuel Morris</li>
        <li>Montegro</li>
        <li>John Kurtz</li>
        <li>Jim</li>
        <li>davelasike</li>
        <li>Louis</li>
        <li>Ali</li>
        <li>dziban303</li>
        <li>Team Jesus</li>
        <li>wesbyte</li>
        <li>steskalj</li>
        <li>Jeremie</li>
        <li>mateusz</li>
        <li>tktcorporation</li>
        <li>Abdull</li>
        <li>Vinayak Lakhani</li>
        <li>Vaz</li>
        <li>lucs100d</li>
        <li>Skaamit</li>
        <li>Volentér Krisztián</li>
        <li>STEPHEN VERNYI</li>
        <li>Reza Andalibi</li>
        <li>Aidan Paradis</li>
      </ul>
    </Page>
  );
}
