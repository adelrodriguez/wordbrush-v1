import sharp from "sharp"

import env from "~/config/env.server"
import db from "~/modules/db.server"
import { uploadBuffer } from "~/utils/upload.server"

async function main() {
  const images = await db.image.findMany({
    include: {
      project: { select: { userId: true } },
    },
    where: { thumbnailUrl: null },
  })

  for (const image of images) {
    if (!image.publicUrl) {
      console.log("No public url for image", image.id)
      continue
    }

    const response = await fetch(image.publicUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const processedImageBuffer = await sharp(buffer)
      .resize(500)
      .toFormat("webp")
      .toBuffer()

    const filename = image.publicUrl.split("/").pop()

    if (!filename) {
      console.log("No filename for image", image.id)
      continue
    }

    const thumbnailFilename = filename.replace(".png", "-thumbnail.png")
    const key = `${image.project.userId}/${image.projectId}/${thumbnailFilename}`

    await uploadBuffer(processedImageBuffer, {
      contentDisposition: "attachment; filename=" + thumbnailFilename,
      contentType: "image/png",
      key,
    })

    const thumbnailUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`

    await db.image.update({
      data: { thumbnailUrl },
      where: { id: image.id },
    })

    console.log("Uploaded thumbnail for image", image.id)
  }
}

void main().then(() => {
  console.log("Done")
  process.exit(0)
})
