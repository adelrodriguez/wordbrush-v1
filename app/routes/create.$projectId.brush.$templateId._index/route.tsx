import {
  getCollectionProps,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { AspectRatio } from "@prisma/client"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import ArtStylePicker from "~/components/ArtStylePicker"
import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { forbidden, notFound } from "~/utils/http.server"

const schema = z.object({
  artStyleId: z.string(),
  aspectRatio: z.nativeEnum(AspectRatio),
  detail: z.number().optional(),
})

export async function loader({ params }: LoaderFunctionArgs) {
  const { templateId } = zx.parseParams(
    params,
    z.object({ templateId: z.string() }),
  )
  const template = await db.template.findUnique({
    select: {
      artStyleId: true,
      aspectRatio: true,
      detail: true,
    },
    where: { id: templateId },
  })

  if (!template) {
    throw notFound()
  }

  const artStyles = await db.artStyle.findMany({
    select: {
      category: true,
      description: true,
      exampleUrl: true,
      id: true,
      name: true,
    },
    where: { show: true },
  })

  return json({ artStyles, template })
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { projectId, templateId } = zx.parseParams(
    params,
    z.object({ projectId: z.string(), templateId: z.string() }),
  )

  const formData = await request.formData()
  const submission = await parseWithZod(formData, {
    async: true,
    schema: schema.superRefine(async (value, context) => {
      const artStyle = await db.artStyle.count({
        where: { id: value.artStyleId },
      })

      if (artStyle === 0) {
        context.addIssue({
          code: "custom",
          message: "Art style not found",
          path: ["artStyleId"],
        })
      }
    }),
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  // Check that the user is the owner of the project
  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  const project = await db.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw notFound()
  }

  try {
    await db.template.update({
      data: {
        artStyleId: submission.value.artStyleId,
        aspectRatio: submission.value.aspectRatio,
        detail: submission.value.detail,
      },
      where: {
        id: templateId,
        projectId,
      },
    })
  } catch (error) {
    throw forbidden()
  }

  return redirect(
    route("/create/:projectId/brush/:templateId/details", {
      projectId,
      templateId,
    }),
  )
}

export default function Route() {
  const { artStyles, template } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    defaultValue: template,
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema: schema }),
  })

  return (
    <Form
      {...getFormProps(form)}
      className="flex flex-col justify-center gap-y-4 py-16"
      method="POST"
    >
      <div className="text-center">
        <h1 className="font-gray-900 text-5xl font-black">
          Choose your art style
        </h1>
        <h2 className="mt-4 text-2xl font-light text-gray-600">
          Choose one of the following art styles
        </h2>
      </div>

      <div className="py-8">
        <ArtStylePicker
          options={artStyles}
          {...getInputProps(fields.artStyleId, { type: "text" })}
        />
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
              <div className="flex items-center" key={collectionProps.id}>
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
          className="block text-sm font-medium leading-6 text-gray-900"
          htmlFor={fields.detail.id}
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
        className="mt-4 rounded-lg bg-slate-900 p-4 text-white hover:bg-slate-700"
        type="submit"
      >
        Let&apos;s finalize the details
      </button>
    </Form>
  )
}
