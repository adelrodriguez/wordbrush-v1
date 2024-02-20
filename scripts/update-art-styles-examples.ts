import env from "~/config/env.server"
import db from "~/modules/db.server"

async function main() {
  const artStyles = await db.artStyle.findMany()

  console.log("Art styles found:", artStyles.length)

  for (const artStyle of artStyles) {
    const filename =
      encodeURIComponent(artStyle.name.split(" ").join("-").toLowerCase()) +
      ".png"

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
