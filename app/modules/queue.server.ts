import { remember } from "@epic-web/remember"
import type { ConnectionOptions, Processor } from "bullmq"
import { Queue, Worker } from "bullmq"

import env from "~/config/env.server"
import Sentry from "~/services/sentry"

export type RegisteredQueue = {
  queue: Queue
  worker: Worker
}

const registeredQueues = remember<Record<string, RegisteredQueue>>(
  "registeredQueues",
  () => ({}),
)

export const connection: ConnectionOptions = {
  host: env.REDIS_HOST,
  password: env.REDIS_PASSWORD,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
}

export function createQueue<Payload>(
  name: string,
  handler: Processor<Payload>,
): Queue<Payload> {
  const registeredQueue = registeredQueues[name]

  if (registeredQueue) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return registeredQueue.queue
  }

  // BullMQ queues are the storage container managing jobs.
  const queue = new Queue<Payload>(name, { connection })

  // Workers are where the meat of our processing lives within a queue. They
  // reach out to our redis connection and pull jobs off the queue in an order
  // determined by factors such as job priority, delay, etc. The scheduler plays
  // an important role in helping workers stay busy.
  const worker = new Worker<Payload>(name, handler, { connection })

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`)

    Sentry.captureException(err)
  })

  registeredQueues[name] = { queue, worker }

  return queue
}
