import { Plan, SubscriptionProvider } from "@prisma/client"
import { Processor } from "bullmq"

import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"

import updateCreditBalance from "./update-credit-balance"

type QueueData = {
  email: string
  externalCustomerId: string
  externalId: string
  productId: string
  provider: SubscriptionProvider
}

const processor: Processor<QueueData> = async (job) => {
  const email = job.data.email
  const externalCustomerId = job.data.externalCustomerId
  const externalId = job.data.externalId
  const provider = job.data.provider
  const productId = job.data.productId

  // TODO(adelrodriguez): When we have multiple plans, we'll need to get the
  // appropriate plan from the product ID
  const plan = Plan.Professional

  // Find or create the user
  let user = await db.user.findUnique({
    where: { email },
  })

  if (!user) {
    user = await db.user.create({
      data: {
        email,
      },
    })
  }

  // Create or update the subscription
  await db.subscription.upsert({
    create: {
      externalCustomerId,
      externalId,
      plan,
      provider,
      userId: user.id,
    },
    update: {
      externalCustomerId,
      externalId,
      plan,
      provider,
    },
    where: { userId: user.id },
  })

  // Queue job to add credits
  await updateCreditBalance.add(`Professional subscription`, {
    amount: 100,
    productId,
    reason: "Professional subscription",
    userId: user.id,
  })
}

export default createQueue("CREATE_PAID_USER_SUBSCRIPTION", processor)
