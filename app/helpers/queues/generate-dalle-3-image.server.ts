import { Processor } from "bullmq"
import { Buffer } from "node:buffer"

import { CREDIT_COST_PER_IMAGE } from "~/config/consts"
import env from "~/config/env.server"
import db from "~/helpers/db.server"
import ai from "~/services/openai.server"
import { getImageSize, getModeStyle } from "~/utils/ai"
import { uploadBuffer } from "~/utils/upload.server"

import { updateCreditBalanceQueue } from "."
import { createQueue } from "../queue.server"

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
    style: getModeStyle(template.mode),
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

  await Promise.all([
    job.log(`Created image ${imageId}`),
    db.image.update({
      data: {
        prompt: image.revised_prompt ?? prompt,
        publicUrl,
        url,
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
