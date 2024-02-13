import { StorageService } from "@prisma/client"
import { Processor } from "bullmq"
import { Buffer } from "node:buffer"

import env from "~/config/env.server"
import db from "~/helpers/db.server"
import ai from "~/services/openai.server"
import { getImageSize } from "~/utils/ai"
import { uploadBuffer } from "~/utils/upload.server"

import { createQueue } from "../queue.server"

const QUEUE_NAME = "CREATE_DALLE_3_IMAGE"

type QueueData = {
  prompt: string
  userId: string
  imageId: string
  templateId: string
}

const processor: Processor<QueueData> = async (job) => {
  const imageId = job.data.imageId
  const prompt = job.data.prompt
  const templateId = job.data.templateId
  const userId = job.data.userId

  const template = await db.template.findUniqueOrThrow({
    where: { id: templateId },
  })

  const response = await ai.images.generate({
    model: "dall-e-3",
    prompt,
    quality: "standard",
    response_format: "b64_json",
    size: getImageSize(template.aspectRatio),
    user: userId,
  })

  const image = response.data[0]

  await job.log(`Generated image ${image?.url}`)

  const filename = Date.now() + ".png"

  if (!image?.b64_json) {
    throw new Error("Failed to generate image")
  }

  const buffer = Buffer.from(image.b64_json, "base64")
  const url = await uploadBuffer(buffer, {
    contentDisposition: "attachment; filename=" + filename,
    contentType: "image/png",
    key: `${userId}/${template.projectId}/${filename}`,
  })

  const publicUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${userId}/${template.projectId}/${filename}`

  await db.image.update({
    data: {
      bucket: env.STORAGE_BUCKET,
      projectId: template.projectId,
      prompt: image.revised_prompt ?? prompt,
      publicUrl,
      service: StorageService.R2,
      templateId: template.id,
      url,
    },
    where: { id: imageId },
  })

  await job.log(`Created image ${imageId}`)
}

export default createQueue(QUEUE_NAME, processor)
