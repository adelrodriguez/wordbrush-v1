import {
  getCollectionProps,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { AspectRatio } from "@prisma/client"
import { ActionFunctionArgs, json, redirect } from "@remix-run/node"
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
} from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { notFound } from "~/utils/http.server"
import { getLocalProject, storeProjectLocally } from "~/utils/project"

const clientSchema = z.object({
  artStyleId: z.string(),
  aspectRatio: z.nativeEnum(AspectRatio),
  detail: z.number().optional(),
})

const serverSchema = z.object({
  artStyleId: z.string().refine(async (value) => {
    const artStyle = await db.artStyle.findUnique({ where: { id: value } })
    return !!artStyle
  }),
  aspectRatio: z.nativeEnum(AspectRatio),
  detail: z.number().optional(),
})

export async function loader() {
  const artStyles = await db.artStyle.findMany({
    select: {
      description: true,
      id: true,
      name: true,
    },
  })

  return json({ artStyles })
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const serverData = await serverLoader<typeof loader>()
  const storedData = getLocalProject()

  return { ...serverData, storedData }
}

clientLoader.hydrate = true

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const formData = await request.clone().formData()
  storeProjectLocally(formData)

  return serverAction()
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const formData = await request.formData()
  const submission = await parseWithZod(formData, {
    async: true,
    schema: serverSchema,
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/create/account"),
  })

  try {
    await db.project.update({
      data: {
        artStyleId: submission.value.artStyleId,
        aspectRatio: submission.value.aspectRatio,
        detail: submission.value.detail,
      },
      where: {
        id: projectId,
        userId: user.id,
      },
    })
  } catch (error) {
    throw notFound()
  }

  return redirect(route("/create/:projectId/details", { projectId }))
}

export function HydrateFallback() {
  // TODO(adelrodriguez): Add a loading state
  return <div>Loading...</div>
}

export default function Route() {
  const { artStyles, storedData } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    defaultValue: storedData,
    lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: clientSchema }),
  })

  return (
    <Form
      {...getFormProps(form)}
      method="POST"
      className="flex min-h-screen flex-col justify-center gap-y-4 py-16"
      onBlur={(event) => storeProjectLocally(new FormData(event.currentTarget))}
    >
      <div className="text-center">
        <h1 className="font-gray-900 text-5xl font-black">
          Choose your art style
        </h1>
        <h2 className="mt-4 text-2xl font-light text-gray-600">
          Choose one of the following art styles
        </h2>
      </div>
      <div>
        <label
          className="text-base font-semibold text-gray-900"
          htmlFor={fields.artStyleId.id}
        >
          Art Style
        </label>
        <p className="text-sm text-gray-500">What kind of style do you want?</p>
        <fieldset className="mt-4">
          <legend className="sr-only">Art Style</legend>
          <div className="space-y-4">
            {getCollectionProps(fields.artStyleId, {
              options: artStyles.map((artStyle) => artStyle.id),
              type: "radio",
            }).map((collectionProps) => (
              <div key={collectionProps.id} className="flex items-center">
                <input
                  {...collectionProps}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  value={collectionProps.value}
                />
                <label
                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                  htmlFor={collectionProps.id}
                >
                  {collectionProps.value}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
        <div>{fields.artStyleId.errors}</div>
      </div>
      <div>
        <label
          className="text-base font-semibold text-gray-900"
          htmlFor={fields.aspectRatio.id}
        >
          Aspect Ratio
        </label>
        <p className="text-sm text-gray-500">
          What aspect ratio do you want to use?
        </p>
        <fieldset className="mt-4">
          <legend className="sr-only">Resolution</legend>
          <div className="space-y-4">
            {getCollectionProps(fields.aspectRatio, {
              options: Object.values(AspectRatio),
              type: "radio",
            }).map((collectionProps) => (
              <div key={collectionProps.id} className="flex items-center">
                <input
                  {...collectionProps}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                  htmlFor={collectionProps.id}
                >
                  {collectionProps.value}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
        <div>{fields.aspectRatio.errors}</div>
      </div>
      <div>
        <label
          htmlFor={fields.detail.id}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Level of detail
        </label>
        <div className="mt-2">
          <input
            {...getInputProps(fields.detail, { type: "number" })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="1"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 rounded-lg bg-slate-900 p-4 text-white hover:bg-slate-700"
      >
        Let&apos;s finalize the details
      </button>
    </Form>
  )
}
