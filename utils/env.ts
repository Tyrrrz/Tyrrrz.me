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
  return process.env.GITHUB_TOKEN;
};

export const getGoogleAnalyticsId = () => {
  return process.env.GOOGLE_ANALYTICS_ID;
};

export const getDisqusId = () => {
  return process.env.DISQUS_ID;
};

export const getEthicalAdsId = () => {
  return process.env.ETHICAL_ADS_ID;
};
