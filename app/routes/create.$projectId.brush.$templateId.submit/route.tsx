import { parseWithZod } from "@conform-to/zod"
import { StorageService } from "@prisma/client"
import { ActionFunctionArgs, json } from "@remix-run/node"
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

import env from "~/config/env.server"
import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import ai from "~/services/openai.server"
import { generatePrompt, getImageSize } from "~/utils/ai"
import { notFound } from "~/utils/http.server"
import { getSavedText, removeSavedText } from "~/utils/text"
import {
  convertBase64StringToBuffer,
  uploadBuffer,
} from "~/utils/upload.server"

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
    return json({ error: "Art style not found", success: false })
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

  const response = await ai.images.generate({
    model: "dall-e-3",
    prompt,
    quality: "standard",
    response_format: "b64_json",
    size: getImageSize(template.aspectRatio),
    user: user.id,
  })

  const image = response.data[0]
  const filename = Date.now() + ".png"

  if (image?.b64_json) {
    const buffer = convertBase64StringToBuffer(image.b64_json)
    const url = await uploadBuffer(buffer, {
      contentType: "image/png",
      key: `${user.id}/${project.id}/${filename}`,
    })

    await db.image.create({
      data: {
        bucket: env.STORAGE_BUCKET,
        projectId: project.id,
        prompt: image.revised_prompt ?? prompt,
        publicUrl: `${env.CLOUDFLARE_R2_PUBLIC_URL}/${user.id}/${project.id}/${filename}`,
        service: StorageService.R2,
        templateId: template.id,
        url: url ?? "",
      },
    })
  }

  await db.project.update({
    data: { status: "Submitted" },
    where: { id: projectId, userId: user.id },
  })

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
  // TODO(adelrodriguez): Add a loading state
  return <div>Loading...</div>
}

export default function Route() {
  const { text } = useLoaderData<typeof clientLoader>()
  const submitting = useRef(false)
  const submit = useSubmit()

  useEffect(() => {
    if (submitting.current) return

    submitting.current = true

    submit({ text }, { method: "POST", replace: true })

    return () => {
      submitting.current = false
    }
  }, [submit, text])

  return <div>Creating your image...</div>
}
