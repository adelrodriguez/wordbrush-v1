import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import auth from "~/helpers/auth.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  return json({ user })
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <main>
      <h1>Logged in as: {user.email}</h1>
      <Outlet />
    </main>
  )
}
