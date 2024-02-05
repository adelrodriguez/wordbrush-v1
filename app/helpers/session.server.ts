import { createCookieSessionStorage } from "@remix-run/node"

import { ONE_MONTH } from "~/config/consts"
import env from "~/config/env.server"
import { isProduction } from "~/config/vars"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: ONE_MONTH.inSeconds,
    name: "wordbrush",
    path: "/",
    sameSite: "lax",
    secrets: [env.REMIX_AUTH_SECRET],
    secure: isProduction,
  },
})

export const { commitSession, destroySession, getSession } = sessionStorage

export default sessionStorage
