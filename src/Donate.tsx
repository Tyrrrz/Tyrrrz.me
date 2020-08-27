import React from 'react';
import { FiCoffee, FiDollarSign } from 'react-icons/fi';
import Layout from './shared/Layout';
import Link from './shared/Link';

export default function DonatePage() {
  return (
    <Layout meta={{ title: 'Donate' }}>
      <h1>Donate</h1>

      <p>
        If you found any of my projects useful and want to support their development, please
        consider making a donation 🙂
      </p>

      <ul>
        <li>
          <Link href="https://patreon.com/Tyrrrz">
            <FiDollarSign /> Patreon
          </Link>{' '}
          (recurring)
        </li>
        <li>
          <Link href="https://buymeacoffee.com/Tyrrrz">
            <FiCoffee /> BuyMeACoffee
          </Link>{' '}
          (one-time)
        </li>
      </ul>

      <p>Top supporters:</p>

      <ul>
        <li>Peter Wesselius</li>
        <li>Mark Ledwich</li>
        <li>BouncingWalrus</li>
        <li>Thomas C</li>
        <li>Dominic Maas</li>
        <li>lupus</li>
        <li>Richard</li>
        <li>Foritus</li>
        <li>Michael Dayah</li>
        <li>Victor Smith</li>
        <li>Sprocketman1981</li>
        <li>Jim Wilson</li>
      </ul>
    </Layout>
  );
}
