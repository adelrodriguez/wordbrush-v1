import { Processor } from "bullmq"
import { Buffer } from "node:buffer"
import sharp from "sharp"

import { CREDIT_COST_PER_IMAGE } from "~/config/consts"
import env from "~/config/env.server"
import cache from "~/modules/cache.server"
import db from "~/modules/db.server"
import { createQueue } from "~/modules/queue.server"
import { updateCreditBalanceQueue } from "~/modules/queues.server"
import ai from "~/services/openai.server"
import { getImageSize, getStyle } from "~/utils/ai"
import { generatePrompt } from "~/utils/ai.server"
import { uploadBuffer } from "~/utils/upload.server"

type QueueData = {
  userId: string
  imageId: string
  templateId: string
  projectId: string
}

const processor: Processor<QueueData> = async (job) => {
  const imageId = job.data.imageId
  const templateId = job.data.templateId
  const userId = job.data.userId
  const projectId = job.data.projectId

  const cacheKey = `project:${projectId}:summary`

  const [template, project, text] = await Promise.all([
    db.template.findUnique({
      include: { artStyle: true },
      where: { id: templateId },
    }),
    db.project.findUniqueOrThrow({
      where: { id: projectId },
    }),
    cache.get(cacheKey),
  ])

  if (!template) {
    throw new Error("Template not found")
  }

  if (!template.artStyle) {
    throw new Error("Art style not found")
  }

  if (!text) {
    throw new Error("Summary not found")
  }

  await job.log(`Using summary from cache: ${text}`)

  const promptResponse = await ai.chat.completions.create({
    messages: [
      {
        content: generatePrompt({
          artStyle: template.artStyle,
          detail: template.detail,
          exclude: template.exclude,
          intendedUse: project.intendedUse,
          keyElements: template.keyElements,
          mood: template.mood,
        }),
        role: "system",
      },
      {
        content: text,
        role: "user",
      },
    ],
    model: "gpt-4-0125-preview",
  })

  const prompt = promptResponse.choices[0]?.message.content
  const promptTokens = promptResponse.usage?.prompt_tokens
  const responseTokens = promptResponse.usage?.completion_tokens
  const totalTokens = promptResponse.usage?.total_tokens

  if (!prompt) {
    throw new Error("Failed to generate prompt")
  }

  await job.log(`Generated prompt: ${prompt}`)
  await job.log(`Prompt tokens: ${promptTokens}`)
  await job.log(`Response tokens: ${responseTokens}`)
  await job.log(`Total tokens: ${totalTokens}`)

  const imageResponse = await ai.images.generate({
    model: "dall-e-3",
    prompt,
    quality: "hd",
    response_format: "b64_json",
    size: getImageSize(template.aspectRatio),
    style: getStyle(template.artStyle.category, template.detail),
    user: userId,
  })

  const image = imageResponse.data[0]

  await job.log(`Generated image ${image?.revised_prompt}`)

  const now = Date.now()
  const filename = now + ".png"
  const thumbnailFilename = now + ".webp"

  if (!image?.b64_json) {
    throw new Error("Failed to generate image")
  }

  const buffer = Buffer.from(image.b64_json, "base64")

  // Create a thumbnail
  const thumbnailBuffer = await sharp(buffer)
    .resize(500)
    .toFormat("webp")
    .toBuffer()

  const imageKey = `${userId}/${template.projectId}/${filename}`
  const thumbnailKey = `${userId}/${template.projectId}/${thumbnailFilename}`

  const [storageUrl] = await Promise.all([
    uploadBuffer(buffer, {
      contentDisposition: "attachment; filename=" + filename,
      contentType: "image/png",
      key: imageKey,
    }),
    uploadBuffer(thumbnailBuffer, {
      contentDisposition: "attachment; filename=" + thumbnailFilename,
      contentType: "image/png",
      key: thumbnailKey,
    }),
  ])

  const publicUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${imageKey}`
  const thumbnailUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${thumbnailKey}`

  await Promise.all([
    job.log(`Created image ${imageId}`),
    db.image.update({
      data: {
        prompt: image.revised_prompt ?? prompt,
        publicUrl,
        thumbnailUrl,
        url: storageUrl,
      },
      where: { id: imageId },
    }),
    updateCreditBalanceQueue.add(`Image ${imageId} created`, {
      amount: -CREDIT_COST_PER_IMAGE,
      reason: `Image ${imageId} created`,
      userId,
    }),
  ])
}

export default createQueue("GENERATE_DALLE_3_IMAGE", processor)
