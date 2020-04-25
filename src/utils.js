exports.humanizeTimeToRead = timeToReadMins => {
  const unit = timeToReadMins === 1 ? 'minute' : 'minutes'
  return `${timeToReadMins} ${unit} to read`
}
