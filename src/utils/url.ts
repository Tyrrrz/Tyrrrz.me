export const getAbsoluteUrl = (base: string, relative: string) => {
  return new URL(relative, base).toString();
};
