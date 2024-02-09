import { ProjectStatus } from "@prisma/client"
import { LoaderFunctionArgs, defer, json } from "@remix-run/node"
import { Await, Link, useLoaderData } from "@remix-run/react"
import { Suspense } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { createDalle3ImageQueue } from "~/helpers/queues"
import { unauthorized } from "~/utils/http.server"
import { getQueueEvents } from "~/utils/job.server"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  // Fetch the project and its images
  const project = await db.project.findFirstOrThrow({
    include: {
      images: {
        select: {
          id: true,
          publicUrl: true,
        },
        where: {
          publicUrl: { not: null },
        },
      },
    },
    where: {
      id: projectId,
      user,
    },
  })

  // Fetch the pending image. We only fetch the first image since it's unlikely
  // that a user might have more than one image, since it will be created by AI
  // before they can create another one. We might need to change this to fetch
  // all pending images if we run into issues with this approach.
  const pendingImage = await db.image.findFirst({
    select: {
      id: true,
      jobId: true,
    },
    where: {
      projectId,
      publicUrl: null,
    },
  })

  if (!pendingImage?.jobId) {
    return json({ pendingImage: null, project })
  }

  const job = await createDalle3ImageQueue.getJob(pendingImage.jobId)
  const isCompleted = await job?.isCompleted()

  if (!job?.id || isCompleted) {
    return json({ pendingImage: null, project })
  }

  const pending = async () => {
    const events = getQueueEvents(createDalle3ImageQueue.name)
    await job.waitUntilFinished(events)

    const image = await db.image.findUniqueOrThrow({
      select: { id: true, publicUrl: true },
      where: { id: pendingImage.id },
    })

    return { image }
  }

  return defer({ pendingImage: pending(), project })
}

export default function Route() {
  const { pendingImage, project } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{project.name}</h1>
      <ul>
        {project.images.map((image) =>
          image.publicUrl ? (
            <li key={image.id}>
              <img alt="" src={image.publicUrl} />
            </li>
          ) : null,
        )}
        {project.status === ProjectStatus.Draft && (
          <Link to={route("/create/:projectId", { projectId: project.id })}>
            Continue
          </Link>
        )}
      </ul>
      <Suspense
        // TODO(adelrodriguez): Add a skeleton loader
        fallback={<div className="h-40 w-40 bg-red-300">Loading image...</div>}
      >
        <Await resolve={pendingImage}>
          {(resolved) =>
            resolved?.image.publicUrl && (
              <img alt="" src={resolved.image.publicUrl} />
            )
          }
        </Await>
      </Suspense>
    </div>
  )
}
