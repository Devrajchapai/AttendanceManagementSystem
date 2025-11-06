const hourToMillisecond = (millisecond) => {

  const inSeconds = millisecond % 1000;
  const hours = (totalSeconds / 3600) | 0;
  remainingSecondsAfterHours = totalSeconds % 3600;
  const minutes = (remainingSecondsAfterHours / 60) | 0;
  const seconds = remainingSecondsAfterHours % 60;

  return {hour, minutes, second}
};

module.exports = hourToMillisecond;
