import { QueueEvents } from "bullmq"

import { connection } from "~/modules/queue.server"

export function getQueueEvents(name: string): QueueEvents {
  const queueEvents = new QueueEvents(name, { connection })

  return queueEvents
}
