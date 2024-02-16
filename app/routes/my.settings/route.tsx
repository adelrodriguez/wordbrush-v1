import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { route } from "routes-gen"

import auth from "~/modules/auth.server"
import db from "~/modules/db.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
  })

  return json({ subscription, user })
}

export default function Route() {
  const { subscription, user } = useLoaderData<typeof loader>()

  return (
    <div className="flex max-w-2xl flex-col gap-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>
      <div className="flex flex-col gap-y-2">
        <h3 className="text-xl font-bold">Account</h3>
        <div>
          <p>
            <span className="font-semibold">User ID:</span> {user.id}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <h3 className="text-xl font-bold">Credits</h3>
        <div>
          <p className="mb-2">Subscription plan: {subscription?.plan}</p>

          <div>
            <p className="mb-4">Total balance: {subscription?.creditBalance}</p>
            <Link
              className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              to={route("/pricing")}
            >
              Purchase more
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
