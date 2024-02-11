import { User } from "@prisma/client"
import { Authenticator } from "remix-auth"
import { TOTPStrategy } from "remix-auth-totp"

import env from "~/config/env.server"
import db from "~/helpers/db.server"
import sessionStorage from "~/helpers/session.server"
import resend from "~/services/resend.server"

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
          html: `<a href="${magicLink}">Click here to sign in</a>. Your code is: ${code}`,
          subject: "Sign in to Wordbrush 🎨",
          to: email,
        })
      },
      updateTOTP: async (hash, data, expiresAt) => {
        await db.totp.update({ data: { ...data, expiresAt }, where: { hash } })
      },
    },
    async ({ email }) => {
      const user = await db.user.upsert({
        create: {
          email,
          isVerified: true,
          lastLoginAt: new Date(),
        },
        update: {
          lastLoginAt: new Date(),
        },
        where: { email },
      })

      return user
    },
  ),
  "TOTP",
)

export default auth
