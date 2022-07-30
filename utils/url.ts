export const isAbsoluteUrl = (url: string) => /^[a-z][a-z\d+\-.]*:/iu.test(url);
