import { LoaderFunctionArgs, json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/modules/auth.server"
import db from "~/modules/db.server"
import { accepted, unauthorized } from "~/utils/http.server"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { imageId, projectId } = zx.parseParams(
    params,
    z.object({ imageId: z.string(), projectId: z.string() }),
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

  const image = await db.image.findFirst({
    select: { id: true, jobId: true, publicUrl: true },
    where: { id: imageId, projectId, publicUrl: { not: null } },
  })

  if (!image) {
    throw accepted({ message: "The image is still being processed." })
  }

  return json({ image })
}
