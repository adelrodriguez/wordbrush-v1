import { remember } from "@epic-web/remember"
import Redis from "ioredis"

import env from "~/config/env.server"

const redis = remember(
  "redis",
  () =>
    new Redis(env.REDIS_URL, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    }),
)

export default redis
