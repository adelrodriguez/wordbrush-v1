import { Button, Chip, Spinner } from "@nextui-org/react"
import { ProjectStatus } from "@prisma/client"
import { LoaderFunctionArgs, defer, json, redirect } from "@remix-run/node"
import {
  Await,
  ClientLoaderFunctionArgs,
  Form,
  Outlet,
  useLoaderData,
} from "@remix-run/react"
import clsx from "clsx"
import { Suspense } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { GeneratedImage } from "~/components/GeneratedImage"
import auth from "~/modules/auth.server"
import db from "~/modules/db.server"
import { generateDalle3ImageQueue } from "~/modules/queues"
import { forbidden, unauthorized } from "~/utils/http.server"
import { getQueueEvents } from "~/utils/job.server"
import { getIntendedUseLabel } from "~/utils/project"
import {
  calculateElementsPerColumn,
  distributeElementsIntoColumns,
} from "~/utils/ui"

import Text from "./Text"

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
        orderBy: { createdAt: "desc" },
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

  if (project.status === ProjectStatus.Draft) {
    return redirect(route("/create/:projectId", { projectId }))
  }

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

  const job = await generateDalle3ImageQueue.getJob(pendingImage.jobId)
  const isCompleted = await job?.isCompleted()

  if (!job?.id || isCompleted) {
    return json({ pendingImage: null, project })
  }

  const pending = async () => {
    const events = getQueueEvents(generateDalle3ImageQueue.name)
    await job.waitUntilFinished(events)

    const image = await db.image.findUniqueOrThrow({
      select: { id: true, publicUrl: true },
      where: { id: pendingImage.id },
    })

    return { image }
  }

  return defer({ pendingImage: pending(), project })
}

export async function clientLoader({
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const serverData = await serverLoader<typeof loader>()
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )
  const text = localStorage.getItem(projectId)

  return { ...serverData, text }
}

clientLoader.hydrate = true

export async function action({ params, request }: LoaderFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  const project = await db.project.findUnique({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw forbidden()
  }

  // Find any unused templates
  let template = await db.template.findFirst({
    where: {
      images: { none: {} },
      projectId,
    },
  })

  if (!template) {
    template = await db.template.create({ data: { projectId } })
  }

  return redirect(
    route("/create/:projectId/brush/:templateId", {
      projectId,
      templateId: template.id,
    }),
  )
}

export function HydrateFallback() {
  return (
    <div>
      <div
        className={clsx(
          "inset relative flex flex-col items-start gap-y-4 py-10 lg:px-10 lg:py-6",
          "lg:fixed lg:bottom-0 lg:left-20 lg:top-16 lg:w-96 lg:overflow-y-auto lg:border-r lg:border-gray-200",
        )}
      >
        <div className="h-12 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-gray-300" />
        <div className="h-36 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-36 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-36 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-36 w-full animate-pulse rounded-md bg-gray-300" />
      </div>
      <div className="lg:pl-96">
        <div className="flex h-56 w-56 animate-pulse items-center justify-center rounded-md bg-gray-300 " />
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div className="flex h-56 w-full items-center justify-center rounded-md bg-red-100/50 text-sm text-red-500">
      Error loading images
    </div>
  )
}

export default function Route() {
  const { pendingImage, project, text } = useLoaderData<typeof clientLoader>()
  const distribution = calculateElementsPerColumn(project.images.length, 4)
  const columns = distributeElementsIntoColumns(project.images, distribution)

  return (
    <>
      <div className="flex flex-col lg:block">
        <div
          className={clsx(
            "inset relative flex flex-col gap-y-4 py-10 lg:px-10 lg:py-6",
            "lg:fixed lg:bottom-0 lg:left-20 lg:top-16 lg:w-96 lg:overflow-y-auto lg:border-r lg:border-gray-200",
          )}
        >
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Chip size="sm">{getIntendedUseLabel(project.intendedUse)}</Chip>
          <div>
            <h2 className="mb-1 text-xs text-gray-500">Your text</h2>
            <div className="text-sm">
              <Text content={text} />
            </div>
          </div>

          {text ? (
            <Form className="flex justify-center" method="POST">
              <Button
                className="background-animated w-full max-w-96 rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 lg:w-full"
                type="submit"
              >
                Create a new image ✨
              </Button>
            </Form>
          ) : (
            <div className="flex justify-center">
              <Button
                className="w-full max-w-96 rounded-md bg-gray-400 px-3.5 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-300 lg:w-full"
                disabled
                type="submit"
              >
                Can&apos;t create a new image without text
              </Button>
            </div>
          )}
        </div>

        <div className="lg:pl-96">
          <ul className="grid grid-cols-4 gap-6">
            <Suspense
              fallback={
                <div className="flex h-56 max-w-full animate-pulse items-center justify-center rounded-md bg-gray-300 ">
                  <Spinner color="white" />
                </div>
              }
            >
              <Await resolve={pendingImage}>
                {(resolved) =>
                  resolved?.image.publicUrl && (
                    <GeneratedImage
                      id={resolved.image.id}
                      projectId={project.id}
                      src={resolved.image.publicUrl}
                    />
                  )
                }
              </Await>
            </Suspense>

            {columns.map((images, index) => (
              <div className="flex flex-col gap-6" key={`group${index}`}>
                {images.map(
                  (image) =>
                    image.publicUrl && (
                      <GeneratedImage
                        id={image.id}
                        key={image.id}
                        projectId={project.id}
                        src={image.publicUrl}
                      />
                    ),
                )}
              </div>
            ))}
          </ul>
        </div>
      </div>
      <Outlet />
    </>
  )
}
