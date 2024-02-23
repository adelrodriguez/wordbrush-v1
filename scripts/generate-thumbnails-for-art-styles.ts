import sharp from "sharp"

import env from "~/config/env.server"
import db from "~/modules/db.server"
import { uploadBuffer } from "~/utils/upload.server"

async function main() {
  const artStyles = await db.artStyle.findMany({
    where: { exampleUrl: { not: { endsWith: ".avif" } } },
  })

  for (const artStyle of artStyles) {
    console.log("Processing art style", artStyle.id)
    if (!artStyle.exampleUrl) {
      console.log("No example url for artStyle", artStyle.id)
      continue
    }

    const response = await fetch(artStyle.exampleUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const processedArtStyleBuffer = await sharp(buffer)
      .resize(512)
      .toFormat("avif")
      .toBuffer()

    const filename =
      encodeURIComponent(artStyle.name.split(" ").join("-").toLowerCase()) +
      ".avif"

    if (!filename) {
      console.log("No filename for artStyle", artStyle.id)
      continue
    }

    const key = `examples/${filename}`

    await uploadBuffer(processedArtStyleBuffer, {
      contentDisposition: "attachment; filename=" + filename,
      contentType: "image/avif",
      key,
    })

    const thumbnailUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`

    await db.artStyle.update({
      data: { exampleUrl: thumbnailUrl },
      where: { id: artStyle.id },
    })

    console.log("Uploaded thumbnail for art style", artStyle.id)
  }
}

void main().then(() => {
  console.log("Done")
  process.exit(0)
})
