import { LoaderFunctionArgs, json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/modules/auth.server"
import cache from "~/modules/cache.server"
import db from "~/modules/db.server"
import { accepted, unauthorized } from "~/utils/http.server"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  // Check if the user has access to the project
  const project = await db.project.findUnique({
    select: { id: true },
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw unauthorized()
  }

  const recommendations = await cache.get(
    `project:${projectId}:recommendations`,
  )

  if (!recommendations) {
    throw accepted({
      message: "The recommendations are still being processed.",
    })
  }

  const artStyles = await db.artStyle.findMany({
    where: { name: { in: recommendations.split(", ") } },
  })

  return json({ recommendations: artStyles })
}
