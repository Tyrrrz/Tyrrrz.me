exports.getAbsoluteUrl = (base, relative) => new URL(relative, base).toString();

exports.isAbsoluteUrl = (url) => /^[a-z][a-z\d+\-.]*:/iu.test(url);

exports.humanizeTimeToRead = (timeToReadMins) => {
  const unit = timeToReadMins === 1 ? 'minute' : 'minutes';
  return `${timeToReadMins} ${unit} to read`;
};
