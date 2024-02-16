import { LoaderFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { GeneratedImage } from "~/components/GeneratedImage"
import auth from "~/modules/auth.server"
import db from "~/modules/db.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  const images = await db.image.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      projectId: true,
      publicUrl: true,
    },
    where: {
      project: {
        userId: user.id,
      },
      publicUrl: { not: null },
    },
  })

  return json({ images })
}

export default function Route() {
  const { images } = useLoaderData<typeof loader>()
  const groupSize = Math.floor(Math.sqrt(images.length))

  const groupedImages = images.reduce(
    (acc: (typeof images)[0][][], image, index) => {
      if (index % groupSize === 0) {
        acc.push([])
      }

      const arr = acc[acc.length - 1]

      if (!arr) {
        return acc
      }

      arr.push(image)

      return acc
    },
    [],
  )

  return (
    <ul className="grid grid-cols-4 gap-6">
      {groupedImages.map((images, index) => (
        <div className="flex flex-col gap-6" key={`group${index}`}>
          {images.map(
            (image) =>
              image.publicUrl && (
                <GeneratedImage
                  id={image.id}
                  key={image.id}
                  projectId={image.projectId}
                  src={image.publicUrl}
                />
              ),
          )}
        </div>
      ))}
    </ul>
  )
}
