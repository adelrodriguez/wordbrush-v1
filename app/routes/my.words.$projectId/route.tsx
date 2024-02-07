import { LoaderFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { unauthorized } from "~/utils/http.server"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const project = await db.project.findFirstOrThrow({
    include: {
      images: true,
    },
    where: {
      id: projectId,
      user,
    },
  })

  return json({ project })
}

export default function Route() {
  const { project } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{project.name}</h1>
      <ul>
        {project.images.map((image) => (
          <li key={image.id}>
            <img src={image.url} alt={image.prompt} />
          </li>
        ))}
      </ul>
    </div>
  )
}
