export const getEnvironment = () => {
  return process.env.NODE_ENV;
};

export const isProduction = () => {
  return getEnvironment() === 'production';
};

export const getBuildId = () => {
  const value = process.env.BUILD_ID;
  if (!value) {
    throw new Error(`Environment variable 'BUILD_ID' is not defined`);
  }

  return value;
};

export const getSiteUrl = (path?: string) => {
  const value = process.env.SITE_URL;
  if (!value) {
    throw new Error(`Environment variable 'SITE_URL' is not defined`);
  }

  if (path) {
    return new URL(path, value).toString();
  }

  return value;
};

export const getGitHubToken = () => {
  const value = process.env.GITHUB_TOKEN;
  if (!value) {
    throw new Error(`Environment variable 'GITHUB_TOKEN' is not defined`);
  }

  return value;
};

export const getPatreonToken = () => {
  const value = process.env.PATREON_TOKEN;
  if (!value) {
    throw new Error(`Environment variable 'PATREON_TOKEN' is not defined`);
  }

  return value;
};

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
