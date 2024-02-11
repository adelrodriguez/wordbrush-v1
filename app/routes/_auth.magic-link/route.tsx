import type { LoaderFunctionArgs } from "@remix-run/node"
import { route } from "routes-gen"

import auth from "~/helpers/auth.server"

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.authenticate("TOTP", request, {
    failureRedirect: route("/login"),
    successRedirect: route("/my"),
  })
}
