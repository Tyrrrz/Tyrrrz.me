import { getEthicalAdsId } from '@/utils/env';
import c from 'classnames';
import Script from 'next/script';
import { FC, useEffect, useState } from 'react';

// https://ethical-ad-client.readthedocs.io/en/latest

declare const ethicalads: {
  load: () => void;
};

type AdvertProps = {
  variant?: 'text' | 'image';
  orientation?: 'horizontal' | 'vertical';
  sticky?: 'aside' | 'footer';
};

const Advert: FC<AdvertProps> = ({ variant = 'text', orientation = 'horizontal', sticky }) => {
  const [isAvailable, setIsAvailable] = useState(() => typeof ethicalads !== 'undefined');

  useEffect(() => {
    if (isAvailable) {
      try {
        ethicalads.load();
      } catch (e) {
        console.error('Failed to render ads', e);
      }
    }
  }, [isAvailable]);

  const ethicalAdsId = getEthicalAdsId();
  if (!ethicalAdsId) {
    return null;
  }

  return (
    <>
      <Script
        src="https://media.ethicalads.io/media/client/ethicalads.min.js"
        strategy="afterInteractive"
        async
        onLoad={() => setIsAvailable(true)}
      />

      <div
        className={c('flat', {
          horizontal: orientation === 'horizontal'
        })}
        data-ea-publisher={ethicalAdsId}
        data-ea-type={variant}
        data-ea-style={
          sticky === 'aside' ? 'stickybox' : sticky === 'footer' ? 'fixedfooter' : null
        }
        data-ea-manual="true"
      />
    </>
  );
};

export default Advert;
