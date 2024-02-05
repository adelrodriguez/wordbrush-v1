export const ONE_SECOND = {
  inMilliseconds: 1000,
  inSeconds: 1,
}

export const ONE_MINUTE = {
  inMilliseconds: ONE_SECOND.inMilliseconds * 60,
  inSeconds: ONE_SECOND.inSeconds * 60,
}

export const ONE_HOUR = {
  inMilliseconds: ONE_MINUTE.inMilliseconds * 60,
  inSeconds: ONE_MINUTE.inSeconds * 60,
}

export const ONE_DAY = {
  inMilliseconds: ONE_HOUR.inMilliseconds * 24,
  inSeconds: ONE_HOUR.inSeconds * 24,
}

export const ONE_WEEK = {
  inMilliseconds: ONE_DAY.inMilliseconds * 7,
  inSeconds: ONE_DAY.inSeconds * 7,
}

export const ONE_MONTH = {
  inMilliseconds: ONE_DAY.inMilliseconds * 30,
  inSeconds: ONE_DAY.inSeconds * 30,
}
