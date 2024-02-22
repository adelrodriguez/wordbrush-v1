import { Processor } from "bullmq"

import db from "~/modules/db.server"
import { createQueue } from "~/modules/queue.server"

type QueueData = {
  userId: string
  amount: number
  reason: string
  productId?: string
}

const processor: Processor<QueueData> = async (job) => {
  const userId = job.data.userId
  const amount = job.data.amount
  const reason = job.data.reason
  const productId = job.data.productId

  const subscription = await db.subscription.findUniqueOrThrow({
    where: { userId },
  })

  const balance = subscription.creditBalance + amount

  await db.subscription.update({
    data: {
      creditBalance: balance,
      creditTransactions: {
        create: {
          amount,
          balance,
          productId,
          reason,
        },
      },
    },
    where: { userId },
  })
}

export default createQueue("UPDATE_CREDIT_BALANCE", processor)
