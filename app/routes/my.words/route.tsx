import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { unauthorized } from "~/utils/http"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const projects = await db.project.findMany({
    where: {
      user,
    },
  })

  return json({ projects })
}

export default function Route() {
  const { projects } = useLoaderData<typeof loader>()

  return (
    <div>
      {projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
      <Link to="/create">Create a new illustration</Link>
    </div>
  )
}
