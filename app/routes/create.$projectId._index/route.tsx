import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { IntendedUse, ProjectStatus } from "@prisma/client"
import {
  LoaderFunctionArgs,
  json,
  redirect,
  type ActionFunctionArgs,
} from "@remix-run/node"
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
import { forbidden } from "~/utils/http.server"
import { getSavedText, saveText } from "~/utils/text"

const schema = z.object({
  intendedUse: z.nativeEnum(IntendedUse),
  name: z.string(),
  text: z.string().min(1).max(100000000), // TODO(adelrodriguez): Add a max length
})

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )
  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  const project = await db.project.findUnique({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    return redirect(route("/my/words"))
  }

  if (project.status !== ProjectStatus.Draft) {
    return redirect(route("/my/words/:projectId", { projectId: project.id }))
  }

  return json({ project })
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const { project } = await serverLoader<typeof loader>()

  return { project, text: getSavedText(project.id) }
}

clientLoader.hydrate = true

export async function clientAction({
  params,
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const formData = await request.clone().formData()
  const text = formData.get("text")

  if (text && typeof text === "string") {
    saveText(text, projectId)
  }

  return serverAction()
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { projectId } = zx.parseParams(
    params,
    z.object({ projectId: z.string() }),
  )

  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema,
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/login"),
  })

  try {
    await db.project.update({
      data: {
        intendedUse: submission.value.intendedUse,
        name: submission.value.name,
      },
      where: { id: projectId, userId: user.id },
    })
  } catch (error) {
    throw forbidden()
  }

  let template = await db.template.findFirst({
    where: { projectId },
  })

  if (!template) {
    template = await db.template.create({ data: { projectId } })
  }

  return redirect(
    route("/create/:projectId/brush/:templateId", {
      projectId,
      templateId: template.id,
    }),
  )
}

export function HydrateFallback() {
  // TODO(adelrodriguez): Add a loading state
  return <div>Loading...</div>
}

export default function Route() {
  const { project, text } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    defaultValue: {
      intendedUse: project.intendedUse,
      text,
    },
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })

  return (
    <Form
      {...getFormProps(form)}
      className="flex min-h-screen flex-col justify-center gap-y-4 py-16"
      method="POST"
    >
      <div className="text-center">
        <h1 className="font-gray-900 text-5xl font-black">
          Tell us about your writing
        </h1>
        <h2 className="mt-4 text-2xl font-light text-gray-600">
          We don&apos;t save your text; everything is stored locally on your
          computer
        </h2>
      </div>
      <div>
        <label
          className="block text-sm font-medium leading-6 text-gray-900"
          htmlFor={fields.name.id}
        >
          Name
        </label>
        <div className="mt-2">
          <input
            {...getInputProps(fields.name, { type: "text" })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Untitled"
          />
        </div>
        {fields.name.errors}
      </div>
      <div className="rounded-xl bg-slate-800 p-6">
        <label
          className="block text-sm font-medium leading-6 text-white"
          htmlFor={fields.text.id}
        >
          Add your text
        </label>
        <div className="mt-2">
          <textarea
            {...getInputProps(fields.text, { type: "text" })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            rows={4}
          />
        </div>
      </div>
      <div>
        <label
          className="text-base font-semibold text-gray-900"
          htmlFor={fields.intendedUse.id}
        >
          Intended Use
        </label>
        <p className="text-sm text-gray-500">
          Where are you publishing this story?
        </p>
        <fieldset className="mt-4">
          <legend className="sr-only">Intended use</legend>
          <div className="space-y-4">
            {Object.keys(IntendedUse).map((intendedUse) => (
              <div className="flex items-center" key={intendedUse}>
                <input
                  {...getInputProps(fields.intendedUse, {
                    type: "radio",
                    value: intendedUse,
                  })}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  defaultChecked={
                    fields.intendedUse.initialValue === intendedUse
                  }
                />
                <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                  {intendedUse}
                </label>
              </div>
            ))}
            <div>{fields.intendedUse.errors}</div>
          </div>
        </fieldset>
      </div>

      <button
        className="mt-4 rounded-lg bg-slate-900 p-4 text-white hover:bg-slate-700"
        type="submit"
      >
        Choose an art style
      </button>
    </Form>
  )
}
