import { PhotoIcon } from "@heroicons/react/24/outline"
import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/modules/auth.server"
import db from "~/modules/db.server"
import { unauthorized } from "~/utils/http.server"
import { getIntendedUseIcon, getIntendedUseLabel } from "~/utils/project"
import { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle = {
  id: "my.word._index",
  search: true,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { search } = zx.parseQuery(
    request,
    z.object({ search: z.string().optional() }),
  )
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const projects = await db.project.findMany({
    include: {
      _count: { select: { images: true } },
      images: {
        orderBy: { createdAt: "desc" },
        select: { thumbnailUrl: true },
        take: 1,
        where: { thumbnailUrl: { not: null } },
      },
    },
    orderBy: { createdAt: "desc" },
    where: {
      name: { contains: search, mode: "insensitive" },
      status: { not: "Removed" },
      user,
    },
  })

  return json({ projects })
}

export default function Route() {
  const { projects } = useLoaderData<typeof loader>()

  return (
    <div>
      <div className="flex justify-end pb-5">
        <Link
          className="background-animated rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          to={route("/create")}
        >
          Create a new project ✨
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-6 divide-gray-100 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <li
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white text-center shadow duration-300 hover:shadow-xl"
            key={project.id}
          >
            <Link to={route("/my/words/:projectId", { projectId: project.id })}>
              <div className="flex h-full flex-col">
                <div className="h-48">
                  {project.images[0]?.thumbnailUrl ? (
                    <img
                      alt={project.name}
                      className="h-full w-full rounded-t-lg object-cover"
                      src={project.images[0]?.thumbnailUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-t-lg bg-gray-100 text-gray-400">
                      No image available
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-y-1 px-4 py-3.5 text-left">
                  <div className="flex justify-between">
                    <div className="mb-0.5 font-semibold">{project.name}</div>
                    {project.status === "Draft" && (
                      <div>
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          Draft
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <div className="flex items-center text-sm font-light">
                      {getIntendedUseIcon(
                        project.intendedUse,
                        "mr-1 inline-block h-4 w-4",
                      )}
                      <span>{getIntendedUseLabel(project.intendedUse)}</span>
                    </div>
                    <div className="text-xs font-light">
                      {project._count.images === 0 ? null : (
                        <>
                          <PhotoIcon className="mr-1 inline-block h-4 w-4" />
                          <span>
                            {project._count.images}{" "}
                            {project._count.images === 1 ? "image" : "images"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
