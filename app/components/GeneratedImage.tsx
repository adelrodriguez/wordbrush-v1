import { ArrowDownTrayIcon } from "@heroicons/react/24/solid"
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
    <div className="group relative">
      <Link
        to={route("/my/words/:projectId/images/:imageId", {
          imageId: id,
          projectId,
        })}
      >
        <img
          alt=""
          className="h-auto max-w-full rounded-md shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          src={src}
        />
      </Link>
      <Link
        className="absolute bottom-0 right-0 hidden rounded-md bg-gray-600 p-1 group-hover:block"
        download
        rel="noreferrer"
        target="_blank"
        to={src}
      >
        <ArrowDownTrayIcon className="h-6 w-6 text-white" />
      </Link>
    </div>
  )
}
