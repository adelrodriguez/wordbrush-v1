import { parseWithZod } from "@conform-to/zod"
import { Progress } from "@nextui-org/react"
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node"
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react"
import { useEffect, useRef } from "react"
import { wait } from "remix-utils/timers"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { DRAFT_PROJECT_KEY, MAX_CHARACTER_LENGTH } from "~/config/consts"
import env from "~/config/env.server"
import auth from "~/modules/auth.server"
import db from "~/modules/db.server"
import { generateDalle3ImageQueue } from "~/modules/queues"
import Sentry from "~/services/sentry"
import { notFound } from "~/utils/http.server"

const schema = z.object({
  text: z.string().min(1).max(MAX_CHARACTER_LENGTH),
})

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { projectId, templateId } = zx.parseParams(
    params,
    z.object({ projectId: z.string(), templateId: z.string() }),
  )

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  const project = await db.project.findUnique({
    select: { id: true },
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw notFound()
  }

  // Check that the user has available balance to submit the project
  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
  })

  if (!subscription || subscription.creditBalance < 1) {
    throw redirect(
      route("/create/:projectId/brush/:templateId/details", {
        projectId,
        templateId,
      }),
    )
  }

  return { project }
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const { project } = await serverLoader<typeof loader>()
  const text = localStorage.getItem(project.id)

  // If the text was deleted from the client, let's throw an error.
  if (!text) {
    throw new Error("Text not found")
  }

  return { text }
}

clientLoader.hydrate = true

export async function action({ params, request }: ActionFunctionArgs) {
  const { projectId, templateId } = zx.parseParams(
    params,
    z.object({ projectId: z.string(), templateId: z.string() }),
  )

  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema,
  })

  if (submission.status !== "success") {
    Sentry.captureMessage("Invalid form submission", {
      extra: { submission },
    })

    // TODO(adelrodriguez): Handle this error in the client
    return json({ error: "Text not found", success: false })
  }

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  const project = await db.project.findUnique({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw notFound()
  }

  const template = await db.template.findUnique({
    include: { artStyle: true },
    where: { id: templateId, projectId: project.id },
  })

  if (!template) {
    throw notFound()
  }

  if (!template.artStyle) {
    Sentry.captureMessage("Art style not found", {
      extra: { template },
    })

    // TODO(adelrodriguez): Handle this error in the client
    return json({ error: "Art style not found", success: false } as const)
  }

  // Check that the user has available balance to submit the project
  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
  })

  if (!subscription || subscription.creditBalance < 1) {
    throw redirect(
      route("/create/:projectId/brush/:templateId/details", {
        projectId,
        templateId,
      }),
    )
  }

  const image = await db.image.create({
    data: {
      bucket: env.STORAGE_BUCKET,
      projectId: project.id,
      service: "R2",
      templateId: template.id,
    },
  })

  const job = await generateDalle3ImageQueue.add(image.id, {
    imageId: image.id,
    projectId: project.id,
    templateId: template.id,
    userId: user.id,
  })

  await db.image.update({
    data: { jobId: job.id },
    where: { id: image.id },
  })

  await db.project.update({
    data: { status: "Submitted" },
    where: { id: projectId, userId: user.id },
  })

  // Artificial delay to give the user a chance to see the loading state
  await wait(5000, { signal: request.signal })

  return redirect(route("/my/words/:projectId", { projectId }))
}

export function clientAction({ serverAction }: ClientActionFunctionArgs) {
  // This removes the saved text from local storage. Since we are not passing a
  // project key, this should remove the text from the draft project in case the
  // user inputs text in the /create route before registering.
  localStorage.removeItem(DRAFT_PROJECT_KEY)

  return serverAction()
}

export function HydrateFallback() {
  return null
}

export default function Route() {
  const { text } = useLoaderData<typeof clientLoader>()
  const submitting = useRef(false)
  const submit = useSubmit()
  const data = useActionData<typeof action>()

  useEffect(() => {
    if (submitting.current) return

    submitting.current = true

    submit({ text }, { method: "POST", replace: true })

    return () => {
      submitting.current = false
    }
  }, [submit, text])

  if (data && !data.success) {
    return (
      <div className="flex h-full min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-semibold">Error</h1>
          <p className="mb-4">{data.error}</p>
          <Link
            className="text-blue-500"
            to={route("/create/:projectId/brush/:templateId/details", {
              projectId: "projectId",
              templateId: "templateId",
            })}
          >
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center">
      <Progress
        classNames={{
          indicator: "bg-gradient-to-r from-orange-300 to-blue-500",
          label: "text-center w-full",
        }}
        isIndeterminate
        label="Generating your image..."
      />
    </div>
  )
}
