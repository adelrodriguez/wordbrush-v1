import { parseWithZod } from "@conform-to/zod"
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node"
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  redirect,
  useLoaderData,
  useSubmit,
} from "@remix-run/react"
import { useEffect, useRef } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import ai from "~/services/openai.server"
import { generatePrompt, getImageSize } from "~/utils/ai"
import { notFound } from "~/utils/http.server"
import { clearLocalProject, getLocalProject } from "~/utils/project"

const schema = z.object({
  text: z.string().min(1).max(100000000), // TODO(adelrodriguez): Add a max length
})

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/create/account"),
  })

  const project = await db.project.findUnique({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    return notFound()
  }

  if (project.status !== "Draft") {
    return redirect(route("/my/words/:projectId", { projectId }))
  }

  return null
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  await serverLoader<typeof loader>()

  const storedData = getLocalProject()

  if (!storedData) {
    throw redirect(route("/create"))
  }

  return { storedData }
}

clientLoader.hydrate = true

export function clientAction({ serverAction }: ClientActionFunctionArgs) {
  clearLocalProject()

  return serverAction()
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema,
  })

  if (submission.status !== "success") {
    return json({ error: "Text not found", success: false })
  }

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/create/account"),
  })

  const project = await db.project.findUnique({
    include: { artStyle: true },
    where: { artStyleId: { not: null }, id: projectId, userId: user.id },
  })

  if (!project) {
    return notFound()
  }

  if (!project.artStyle) {
    return json({ error: "Art style not found", success: false })
  }

  const prompt = generatePrompt(submission.value.text, {
    ...project,
    artStyle: project.artStyle,
  })

  // TODO(adelrodriguez): Launch jobs for:
  // Summarizing
  // Generating art style recommendations
  // Generating mood recommendations

  const response = await ai.images.generate({
    model: "dall-e-3",
    prompt,
    quality: "standard",
    response_format: "url",
    size: getImageSize(project.aspectRatio),
    user: user.id,
  })

  const image = response.data[0]

  if (image) {
    await db.image.create({
      data: {
        projectId: project.id,
        prompt: image.revised_prompt ?? prompt,
        url: image.url ?? "",
      },
    })
  }

  await db.project.update({
    data: { status: "Submitted" },
    where: { id: projectId, userId: user.id },
  })

  return redirect(route("/my/words/:projectId", { projectId }))
}

export function HydrateFallback() {
  // TODO(adelrodriguez): Add a loading state
  return <div>Loading...</div>
}

export default function Route() {
  const { storedData } = useLoaderData<typeof clientLoader>()
  const submitting = useRef(false)
  const submit = useSubmit()

  useEffect(() => {
    if (submitting.current) return

    submitting.current = true

    submit({ text: storedData.text }, { method: "POST", replace: true })

    return () => {
      submitting.current = false
    }
  }, [submit, storedData.text])

  return <div>Creating your image...</div>
}
