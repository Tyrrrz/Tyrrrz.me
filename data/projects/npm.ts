export const getNpmDownloads = async (packageNames: string[]) => {
  const results: Record<string, number> = {};

  const start = '2000-01-01';
  const end = new Date().toISOString().split('T')[0];

  for (const packageName of packageNames) {
    const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName.toLowerCase()}`;
    const response = await fetch(url);

    // If the package doesn't exist, record 0 instead of failing
    if (response.status === 404) {
      results[packageName] = 0;
    } else if (!response.ok) {
      throw new Error(
        `Request 'GET ${url}' failed. Status: ${response.status}. Body: '${await response.text()}'.`
      );
    } else {
      // https://api.npmjs.org/
      type ResponseBody = {
        downloads: number;
      };

      const body: ResponseBody = await response.json();
      results[packageName] = body.downloads || 0;
    }

    // Small delay between requests to respect Cloudflare rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
};
