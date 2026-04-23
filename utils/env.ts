export const getEnvironment = () => {
  return process.env.NODE_ENV;
};

export const isProduction = () => {
  return getEnvironment() === 'production';
};

export const getBuildId = () => process.env.BUILD_ID || 'unknown_build_id';

export const getSiteUrl = (path?: string) => {
  const value = process.env.SITE_URL || 'http://localhost:3000';

  if (path) {
    return new URL(path, value).toString();
  }

  return value;
};

// https://github.com/settings/tokens
export const getGitHubToken = () => process.env.GITHUB_TOKEN;

// https://patreon.com/portal/registration/register-clients
export const getPatreonToken = () => process.env.PATREON_TOKEN;

// https://developers.buymeacoffee.com/dashboard
export const getBuyMeACoffeeToken = () => process.env.BUY_ME_A_COFFEE_TOKEN;

export const getPrivateDonors = () => process.env.PRIVATE_DONORS?.split(',') ?? [];
