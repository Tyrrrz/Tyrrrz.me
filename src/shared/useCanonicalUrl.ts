import { useRouter } from 'next/dist/client/router';
import config from '../infra/config';
import { getAbsoluteUrl } from '../infra/utils';

export default function useCanonicalUrl() {
  const router = useRouter();
  return getAbsoluteUrl(config.siteUrl, router.asPath);
}
