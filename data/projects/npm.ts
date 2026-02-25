export const getNpmDownloads = async (packageNames: string[]) => {
  if (packageNames.length === 0) {
    return {} as Record<string, number>;
  }

  const start = '2000-01-01';
  const end = new Date().toISOString().split('T')[0];
  const packages = packageNames.map((n) => n.toLowerCase()).join(',');
  const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${packages}`;
  const response = await fetch(url);

  // If none of the packages exist, return zeros instead of failing
  if (response.status === 404) {
    return Object.fromEntries(packageNames.map((name) => [name, 0]));
  }

  if (!response.ok) {
    throw new Error(
      `Request 'GET ${url}' failed. Status: ${response.status}. Body: '${await response.text()}'.`
    );
  }

  // https://api.npmjs.org/
  // Bulk response is keyed by package name; null means the package doesn't exist
  type ResponseBody = Record<string, { downloads: number } | null>;

  const body: ResponseBody = await response.json();

  return Object.fromEntries(
    packageNames.map((name) => [name, body[name.toLowerCase()]?.downloads ?? 0])
  );
};
