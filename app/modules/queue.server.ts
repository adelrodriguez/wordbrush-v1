import { remember } from "@epic-web/remember"
import type { Processor } from "bullmq"
import { Queue, Worker } from "bullmq"

import redis from "~/modules/redis.server"

export type RegisteredQueue = {
  queue: Queue
  worker: Worker
}

const registeredQueues = remember<Record<string, RegisteredQueue>>(
  "registeredQueues",
  () => ({}),
)

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
  const queue = new Queue<Payload>(name, { connection: redis })

  // Workers are where the meat of our processing lives within a queue. They
  // reach out to our redis connection and pull jobs off the queue in an order
  // determined by factors such as job priority, delay, etc. The scheduler plays
  // an important role in helping workers stay busy.
  const worker = new Worker<Payload>(name, handler, { connection: redis })

  // TODO(adelrodriguez): Handle job failures
  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`)
  })

  registeredQueues[name] = { queue, worker }

  return queue
}
