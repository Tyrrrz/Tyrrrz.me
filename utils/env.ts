export const getEnvironment = () => {
  return process.env.NODE_ENV;
};

export const isProduction = () => {
  return getEnvironment() === 'production';
};

export const getBuildId = () => {
  return process.env.BUILD_ID || 'dev';
};

export const getSiteUrl = (path?: string) => {
  const value = process.env.SITE_URL || 'https://tyrrrz.me';

  if (path) {
    return new URL(path, value).toString();
  }

  return value;
};

// https://github.com/settings/tokens
export const getGitHubToken = () => {
  const value = process.env.GITHUB_TOKEN;
  if (!value) {
    throw new Error(`Environment variable 'GITHUB_TOKEN' is not defined`);
  }

  return value;
};

// https://patreon.com/portal/registration/register-clients
export const getPatreonToken = () => {
  const value = process.env.PATREON_TOKEN;
  if (!value) {
    throw new Error(`Environment variable 'PATREON_TOKEN' is not defined`);
  }

  return value;
};

// https://developers.buymeacoffee.com/dashboard
export const getBuyMeACoffeeToken = () => {
  const value = process.env.BUYMEACOFFEE_TOKEN;
  if (!value) {
    throw new Error(`Environment variable 'BUYMEACOFFEE_TOKEN' is not defined`);
  }

  return value;
};

export const getPrivateDonors = () => {
  const value = process.env.PRIVATE_DONORS;
  if (!value) {
    return [];
  }

  return value.split('\n');
};
