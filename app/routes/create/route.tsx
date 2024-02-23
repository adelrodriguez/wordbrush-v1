import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"
import { posthog } from "posthog-js"
import { route } from "routes-gen"

import auth from "~/modules/auth.server"

export const meta: MetaFunction = () => [
  { title: "Create a new image | 🎨 Wordbrush" },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request)

  return json({ isAuthenticated: !!user })
}

export default function Route() {
  const { isAuthenticated } = useLoaderData<typeof loader>()
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-start px-4 md:p-0">
      <Link
        className="absolute left-4 top-4 text-sm font-semibold leading-6 text-gray-900"
        onClick={() => {
          posthog.capture("exited_create")
        }}
        to={isAuthenticated ? route("/my/words") : route("/")}
      >
        <span aria-hidden="true">&larr;</span> Exit
      </Link>
      <Outlet />
    </main>
  )
}
