import { ArrowDownTrayIcon } from "@heroicons/react/24/solid"
import { Spinner } from "@nextui-org/react"
import type { Image } from "@prisma/client"
import { Link } from "@remix-run/react"
import { useQuery } from "@tanstack/react-query"
import { route } from "routes-gen"

export function GeneratedImage({
  id,
  projectId,
  publicUrl,
  thumbnailUrl,
}: Pick<Image, "id" | "projectId" | "publicUrl" | "thumbnailUrl">) {
  const { data, isError, isFetching } = useQuery({
    enabled: !publicUrl || !thumbnailUrl,
    initialData: {
      publicUrl,
      thumbnailUrl,
    },
    queryFn: async () => {
      const response = await fetch(
        route("/api/project/:projectId/images/:imageId", {
          imageId: id,
          projectId,
        }),
      )

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      if (response.status === 202) {
        throw new Error("The image is still being processed.")
      }

      const data = (await response.json()) as {
        image: Pick<Image, "publicUrl" | "thumbnailUrl"> | null
      }

      return data.image
    },
    queryKey: ["project", projectId, "image", id],
    retry(failureCount, error) {
      return (
        error.message === "The image is still being processed." &&
        failureCount < 10
      )
    },
    retryDelay(attemptIndex) {
      return 1000 * (attemptIndex + 1)
    },
  })

  if (isFetching) {
    return (
      <div className="flex h-full min-h-52 w-full animate-pulse items-center justify-center rounded-md bg-gray-300 ">
        <Spinner color="white" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-52 w-full items-center justify-center rounded-md bg-red-100/50 text-sm text-red-500">
        Error loading image
      </div>
    )
  }

  if (!data?.publicUrl || !data.thumbnailUrl) return null

  return (
    <div className="group relative">
      <Link
        preventScrollReset
        to={route("/my/words/:projectId/images/:imageId", {
          imageId: id,
          projectId,
        })}
      >
        <img
          alt=""
          className="h-auto max-w-full rounded-md shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          src={data.thumbnailUrl}
        />
      </Link>
      <Link
        className="absolute bottom-0 right-0 hidden rounded-md bg-gray-600 p-1 group-hover:block"
        download
        rel="noreferrer"
        target="_blank"
        to={data.publicUrl}
      >
        <ArrowDownTrayIcon className="h-6 w-6 text-white" />
      </Link>
    </div>
  )
}
