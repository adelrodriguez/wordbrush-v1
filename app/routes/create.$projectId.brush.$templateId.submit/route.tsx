import { parseWithZod } from "@conform-to/zod"
import { Progress } from "@nextui-org/react"
import { StorageService } from "@prisma/client"
import { ActionFunctionArgs, json } from "@remix-run/node"
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
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import env from "~/config/env.server"
import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { createDalle3ImageQueue } from "~/helpers/queues"
import { generatePrompt } from "~/utils/ai.server"
import { notFound } from "~/utils/http.server"
import { getSavedText, removeSavedText } from "~/utils/text"

const schema = z.object({
  text: z.string().min(1).max(100000000), // TODO(adelrodriguez): Add a max length
})

export function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )
  const text = getSavedText(projectId)

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

  // TODO(adelrodriguez): Handle this error in the client
  if (submission.status !== "success") {
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

  // TODO(adelrodriguez): Handle this error in the client
  if (!template.artStyle) {
    return json({ error: "Art style not found", success: false } as const)
  }

  const prompt = generatePrompt(submission.value.text, {
    artStyle: template.artStyle,
    detail: template.detail,
    exclude: template.exclude,
    intendedUse: project.intendedUse,
    keyElements: template.keyElements,
    mood: template.mood,
  })

  // TODO(adelrodriguez): Launch jobs for:
  // Summarizing (probably using GPT-3.5, better done when creating the project)
  // Generating art style recommendations (done when creating the project)
  // Generating mood recommendations (done when creating the project)
  const image = await db.image.create({
    data: {
      bucket: env.STORAGE_BUCKET,
      projectId: project.id,
      service: StorageService.R2,
      templateId: template.id,
    },
  })

  const job = await createDalle3ImageQueue.add(image.id, {
    imageId: image.id,
    prompt,
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
  await new Promise((resolve) => setTimeout(resolve, 5000))

  return redirect(route("/my/words/:projectId", { projectId }))
}

export function clientAction({ serverAction }: ClientActionFunctionArgs) {
  // This removes the saved text from local storage. Since we are not passing a
  // project key, this should remove the text from the draft project in case the
  // user inputs text in the /create route before registering.
  removeSavedText()

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
