import { Link } from "@remix-run/react"
import { route } from "routes-gen"

export function GeneratedImage({
  id,
  projectId,
  src,
}: {
  id: string
  projectId: string
  src: string
}) {
  return (
    <Link
      to={route("/my/words/:projectId/images/:imageId", {
        imageId: id,
        projectId,
      })}
    >
      <img
        alt=""
        className="h-auto max-w-full rounded-md shadow-inner transition-all duration-300 hover:scale-110 hover:shadow-lg"
        src={src}
      />
    </Link>
  )
}
