export const getNpmDownloads = async (packageName: string) => {
  const start = '2000-01-01';
  const end = new Date().toISOString().split('T')[0];
  const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName.toLowerCase()}`;
  const response = await fetch(url);

  // If the package doesn't exist, or the request is blocked (e.g. Cloudflare rate-limit),
  // return 0 instead of failing
  if (!response.ok) {
    return 0;
  }

  // https://api.npmjs.org/
  type ResponseBody = {
    downloads: number;
  };

  const body: ResponseBody = await response.json();

  return body.downloads || 0;
};
