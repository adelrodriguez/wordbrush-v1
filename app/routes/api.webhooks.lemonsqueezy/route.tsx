import { Plan, SubscriptionProvider, WebhookService } from "@prisma/client"
import { ActionFunctionArgs } from "@remix-run/node"
import { Buffer } from "node:buffer"
import crypto from "node:crypto"
import { z } from "zod"

import { TRIAL_CREDITS } from "~/config/consts"
import env from "~/config/env.server"
import db from "~/modules/db.server"
import { createPaidUserSubscriptionQueue } from "~/modules/queues"
import updateCreditBalance from "~/modules/queues/update-credit-balance"
import { badRequest, noContent, unauthorized } from "~/utils/http.server"

const EventSchema = z.object({
  meta: z.object({
    webhook_id: z.string(),
  }),
})

const AttributeSchema = z.object({
  customer_id: z.coerce.string(),
  user_email: z.string(),
})

const OrderSchema = z.object({
  data: z.object({
    attributes: AttributeSchema.extend({
      first_order_item: z.object({
        product_id: z.coerce.string(),
      }),
    }),
    id: z.string(),
  }),
})

const SubscriptionSchema = z.object({
  data: z.object({
    attributes: AttributeSchema.extend({
      subscription_id: z.coerce.string(),
    }),
    id: z.string(),
  }),
})

export async function action({ request }: ActionFunctionArgs) {
  const headers = request.headers
  const eventHeader = headers.get("x-event-name")
  const signatureHeader = headers.get("x-signature")

  if (!eventHeader) {
    throw badRequest({ message: "Missing event name", title: "Bad Request" })
  }

  if (!signatureHeader) {
    throw badRequest({
      message: "Missing signature header",
      title: "Bad Request",
    })
  }

  const clone = request.clone()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [json, text] = await Promise.all([clone.json(), request.text()])

  const hmac = crypto.createHmac("sha256", env.LEMONSQUEEZY_SIGNING_SECRET)
  const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8")
  const signature = Buffer.from(signatureHeader, "utf8")

  if (!crypto.timingSafeEqual(digest, signature)) {
    throw unauthorized({ message: "Invalid signature", title: "Unauthorized" })
  }

  const eventData = EventSchema.parse(json)

  await db.webhook.create({
    data: {
      event: eventHeader,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload: json,
      service: WebhookService.LemonSqueezy,
      webhookId: eventData.meta.webhook_id,
    },
  })

  switch (eventHeader) {
    case "order_created": {
      const order = OrderSchema.parse(json)
      const product = await db.product.findUnique({
        where: {
          externalId: order.data.attributes.first_order_item.product_id,
        },
      })

      if (!product) {
        return badRequest()
      }

      let user = await db.user.findUnique({
        where: { email: order.data.attributes.user_email },
      })

      if (!user) {
        user = await db.user.create({
          data: {
            email: order.data.attributes.user_email,
            isVerified: true,
            lastLoginAt: new Date(),
            subscription: {
              create: {
                creditBalance: TRIAL_CREDITS,
                creditTransactions: {
                  create: {
                    amount: TRIAL_CREDITS,
                    balance: TRIAL_CREDITS,
                    reason: "Trial credits",
                  },
                },
                plan: Plan.Personal,
                provider: null,
              },
            },
          },
        })
      }

      await updateCreditBalance.add(`Order ${order.data.id}`, {
        amount: product.creditAmount,
        productId: product.id,
        reason: `Order ${order.data.id}`,
        userId: user.id,
      })

      return null
    }

    case "order_refunded": {
      const order = OrderSchema.parse(json)
      const product = await db.product.findUnique({
        where: {
          externalId: order.data.attributes.first_order_item.product_id,
        },
      })

      if (!product) {
        return badRequest()
      }

      const user = await db.user.findUnique({
        where: { email: order.data.attributes.user_email },
      })

      if (!user) {
        throw badRequest({ message: "User not found", title: "Bad Request" })
      }

      await updateCreditBalance.add(`Refund ${order.data.id}`, {
        amount: -product.creditAmount,
        reason: `Refund ${order.data.id}`,
        userId: user.id,
      })

      return null
    }

    case "subscription_created": {
      const { data } = SubscriptionSchema.parse(json)
      await createPaidUserSubscriptionQueue.add(eventData.meta.webhook_id, {
        email: data.attributes.user_email,
        externalCustomerId: data.attributes.customer_id,
        externalId: data.id,
        productId: data.attributes.subscription_id,
        provider: SubscriptionProvider.LemonSqueezy,
      })

      return null
    }

    default: {
      return noContent()
    }
  }
}
