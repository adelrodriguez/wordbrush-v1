import { Plan, User } from "@prisma/client"
import { Authenticator } from "remix-auth"
import { TOTPStrategy } from "remix-auth-totp"

import { MagicLink } from "~/components/email"
import { TRIAL_CREDITS } from "~/config/consts"
import env from "~/config/env.server"
import db from "~/modules/db.server"
import sessionStorage from "~/modules/session.server"
import resend from "~/services/resend.server"
import Sentry from "~/services/sentry"

const auth = new Authenticator<User>(sessionStorage)

auth.use(
  new TOTPStrategy(
    {
      createTOTP: async (data, expiresAt) => {
        await db.totp.create({ data: { ...data, expiresAt } })
        // TODO(adelrodriguez): Remove expired TOTPs
      },
      readTOTP: async (hash) => {
        return db.totp.findUnique({ where: { hash } })
      },
      secret: env.ENCRYPTION_SECRET,
      sendTOTP: async ({ code, email, magicLink }) => {
        await resend.emails.send({
          from: "no-reply@wordbrush.art",
          html: "",
          react: <MagicLink code={code} magicLink={magicLink} />,
          subject: "Sign in to Wordbrush 🎨",
          to: email,
        })
      },
      updateTOTP: async (hash, data, expiresAt) => {
        await db.totp.update({ data: { ...data, expiresAt }, where: { hash } })
      },
    },
    async ({ email }) => {
      try {
        const user = await db.user.upsert({
          create: {
            email,
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
          update: {
            lastLoginAt: new Date(),
          },
          where: { email },
        })

        return user
      } catch (error) {
        console.error(error)
        Sentry.captureException(error)

        throw new Error(
          "There was an error creating the user. Please try again.",
        )
      }
    },
  ),
  "TOTP",
)

export default auth
