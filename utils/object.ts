export const deleteUndefined = (obj: any) => {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'undefined') {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      deleteUndefined(obj[key]);
    }
  }

  return obj;
};
