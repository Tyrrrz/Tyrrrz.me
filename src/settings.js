const ensureEndsWithSlash = str => (!str.endsWith('/') ? str + '/' : str);

module.exports = {
  siteDomain: ensureEndsWithSlash(
    process.env.TYRRRZME_DOMAIN || `https://tyrrrz.me/`
  ),
  disqusId: process.env.TYRRRZME_DISQUS,
  googleAnalyticsId: process.env.TYRRRZME_GOOGLEANALYTICS
};
