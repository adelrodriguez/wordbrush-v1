import { User } from "@prisma/client"
import bcrypt from "bcrypt"
import { Authenticator } from "remix-auth"
import { FormStrategy } from "remix-auth-form"

import db from "~/helpers/db.server"
import sessionStorage from "~/helpers/session.server"

const auth = new Authenticator<User>(sessionStorage)

auth.use(
  new FormStrategy(async ({ form }) => {
    // We assume the email and the password have already been validated

    const email = form.get("email") as string
    const password = form.get("password") as string

    const user = await db.user.findUnique({
      where: { email },
      include: { password: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (!user.password) {
      throw new Error("Password not found")
    }

    const passwordMatch = await bcrypt.compare(password, user.password.hash)

    if (!passwordMatch) {
      throw new Error("Password does not match")
    }

    return user
  }),
  "email-password",
)

export default auth
