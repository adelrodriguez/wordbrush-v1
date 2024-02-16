import type { LoaderFunctionArgs } from "@remix-run/node"

import auth from "~/modules/auth.server"

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.logout(request, { redirectTo: "/login" })
}
