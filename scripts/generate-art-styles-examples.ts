import env from "~/config/env.server"
import db from "~/modules/db.server"
import ai from "~/services/openai.server"
import { uploadBuffer } from "~/utils/upload.server"

async function main() {
  const artStyles = await db.artStyle.findMany()

  console.log("Art styles found:", artStyles.length)

  for (const artStyle of artStyles) {
    const response = await ai.images.generate({
      model: "dall-e-3",
      prompt: "Generate an example of the art style: " + artStyle.name,
      quality: "hd",
      response_format: "b64_json",
      size: "1024x1024",
      style: "vivid",
    })

    const image = response.data[0]

    if (!image?.b64_json) {
      throw new Error("No image generated for art style: " + artStyle.name)
    }

    const filename =
      encodeURIComponent(artStyle.name.split(" ").join("-").toLowerCase()) +
      ".png"

    const buffer = Buffer.from(image.b64_json, "base64")

    await uploadBuffer(buffer, {
      contentDisposition: "attachment; filename=" + filename,
      contentType: "image/png",
      key: `examples/${filename}`,
    })

    const publicUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/examples/${filename}`

    await db.artStyle.update({
      data: { exampleUrl: publicUrl },
      where: { id: artStyle.id },
    })
  }
}

void main().then(() => {
  console.log("Done")
  process.exit(0)
})
