import { QueueEvents } from "bullmq"

import redis from "~/modules/redis.server"

export function getQueueEvents(name: string): QueueEvents {
  const queueEvents = new QueueEvents(name, { connection: redis })

  return queueEvents
}
