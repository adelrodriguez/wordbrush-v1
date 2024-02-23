import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { route } from "routes-gen"

import { GeneratedImage } from "~/components/GeneratedImage"
import auth from "~/modules/auth.server"
import db from "~/modules/db.server"
import {
  calculateElementsPerColumn,
  distributeElementsIntoColumns,
} from "~/utils/ui"

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
      thumbnailUrl: true,
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
  const distribution = calculateElementsPerColumn(images.length, 4)
  const columns = distributeElementsIntoColumns(images, distribution)

  return (
    <>
      <ul className="grid grid-cols-4 gap-6">
        {columns.map((images, index) => (
          <div className="flex flex-col gap-6" key={`group${index}`}>
            {images.map((image) => (
              <GeneratedImage
                id={image.id}
                key={image.id}
                projectId={image.projectId}
                publicUrl={image.publicUrl}
                thumbnailUrl={image.thumbnailUrl}
                to={route("/my/images/:imageId", { imageId: image.id })}
              />
            ))}
          </div>
        ))}
      </ul>
      <Outlet />
    </>
  )
}
