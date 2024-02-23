import { Dialog, Transition } from "@headlessui/react"
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Tooltip } from "@nextui-org/react"
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData, useNavigate } from "@remix-run/react"
import { posthog } from "posthog-js"
import { Fragment, useState } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import db from "~/modules/db.server"
import { notFound } from "~/utils/http.server"

export async function loader({ params }: LoaderFunctionArgs) {
  const { imageId } = zx.parseParams(params, z.object({ imageId: z.string() }))

  const image = await db.image.findUnique({
    include: {
      project: {
        select: {
          name: true,
        },
      },
      template: {
        include: {
          artStyle: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    where: { id: imageId },
  })

  if (!image) {
    throw notFound()
  }

  if (!image.publicUrl) {
    throw redirect(route("/my/images"))
  }

  return json({ image })
}

export default function Route() {
  const [open, setOpen] = useState(true)
  const { image } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  function handleLeave() {
    navigate(route("/my/images"), { preventScrollReset: true })
  }

  return (
    <Transition appear as={Fragment} show={open}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          setOpen(false)
        }}
      >
        <Transition.Child
          afterLeave={handleLeave}
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              afterLeave={handleLeave}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex w-full max-w-4xl transform flex-col overflow-hidden rounded-2xl bg-white  text-left align-middle shadow-xl transition-all">
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <img
                  alt={image.prompt ?? ""}
                  className="h-auto max-h-[75vh] max-w-full object-contain"
                  src={image.publicUrl ?? undefined}
                />

                <div className="flex items-start justify-between p-6">
                  <div className="flex flex-col gap-y-0.5">
                    <div className="flex items-center">
                      <h2 className="pb-1 text-lg font-semibold text-gray-600">
                        {image.template.artStyle?.name}
                      </h2>
                      <Link
                        className="ml-2 text-xs text-gray-500 hover:underline"
                        to={route("/my/words/:projectId", {
                          projectId: image.projectId,
                        })}
                      >
                        Go to project &rarr;
                      </Link>
                    </div>

                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Aspect Ratio: </span>
                      {image.template.aspectRatio}
                      <span className="font-semibold">
                        {" "}
                        • Detail Level:
                      </span>{" "}
                      {image.template.detail}
                      {image.template.mood && (
                        <>
                          <span className="font-semibold"> • Mood:</span>{" "}
                          {image.template.mood}
                        </>
                      )}
                      <span className="font-semibold"> • Project: </span>
                      {image.project.name}
                    </p>
                    {image.template.keyElements && (
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Key Elements:</span>{" "}
                        {image.template.keyElements}
                      </p>
                    )}
                    {image.template.exclude && (
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Exclude:</span>{" "}
                        {image.template.exclude}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-x-4">
                    <Tooltip content="Download this image">
                      <Link
                        className=" rounded-md bg-gray-600 p-2 hover:bg-gray-500"
                        download
                        onClick={() => {
                          posthog.capture("download_image", {
                            imageId: image.id,
                          })
                        }}
                        rel="noreferrer"
                        target="_blank"
                        to={image.publicUrl ?? "#"}
                      >
                        <ArrowDownTrayIcon className="h-6 w-6 text-white" />
                      </Link>
                    </Tooltip>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
