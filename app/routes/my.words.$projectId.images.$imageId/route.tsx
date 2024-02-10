import { Dialog, Transition } from "@headlessui/react"
import {
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useNavigate } from "@remix-run/react"
import { Fragment, useState } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import db from "~/helpers/db.server"
import { notFound } from "~/utils/http.server"

export async function loader({ params }: LoaderFunctionArgs) {
  const { imageId } = zx.parseParams(params, z.object({ imageId: z.string() }))

  const image = await db.image.findUnique({
    include: {
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
    throw redirect(
      route("/my/words/:projectId", { projectId: image.projectId }),
    )
  }

  return json({ image })
}

export default function Route() {
  const [open, setOpen] = useState(true)
  const { image } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  function handleLeave() {
    navigate(route("/my/words/:projectId", { projectId: image.projectId }), {
      preventScrollReset: false,
    })
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
                  alt=""
                  className="h-auto max-h-[75vh] max-w-full object-contain"
                  src={image.publicUrl ?? undefined}
                />

                <div className="flex justify-between p-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-600">
                      {image.template.artStyle?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      <span className="font-bold">Aspect Ratio: </span>
                      {image.template.aspectRatio} •{" "}
                      <span className="font-bold">Detail Level:</span>{" "}
                      {image.template.detail}
                      {image.template.mood && (
                        <>
                          {" "}
                          • <span className="font-bold">Mood:</span>{" "}
                          {image.template.mood}
                        </>
                      )}
                    </p>
                    {image.template.keyElements && (
                      <p className="text-sm font-bold text-gray-500">
                        Key Elements: {image.template.keyElements}
                      </p>
                    )}
                    {image.template.exclude && (
                      <p className="text-sm font-bold text-gray-500">
                        Exclude: {image.template.exclude}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-x-4">
                    <Form className="flex items-center" method="POST">
                      <button
                        className="rounded-md bg-gray-600 p-2 hover:bg-gray-500"
                        title="Duplicate this image style"
                        type="submit"
                      >
                        <DocumentDuplicateIcon className="h-6 w-6 text-white" />
                      </button>
                    </Form>
                    <Link
                      className=" rounded-md bg-gray-600 p-2 hover:bg-gray-500"
                      download
                      rel="noreferrer"
                      target="_blank"
                      to={image.publicUrl ?? "#"}
                    >
                      <ArrowDownTrayIcon className="h-6 w-6 text-white" />
                    </Link>
                    {/* <Link
                      className=" rounded-md bg-red-600 p-2 hover:bg-red-500"
                      to={image.publicUrl ?? "#"}
                    >
                      <TrashIcon className="h-6 w-6 text-white" />
                    </Link> */}
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
