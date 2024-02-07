import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { IntendedUse } from "@prisma/client"
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node"
import {
  ClientActionFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
} from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { getLocalProject, storeProjectLocally } from "~/utils/project"

const schema = z.object({
  intendedUse: z.nativeEnum(IntendedUse),
  name: z.string(),
  text: z.string().min(1).max(100000000), // TODO(adelrodriguez): Add a max length
})

export async function clientLoader() {
  return { storedData: getLocalProject() }
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema,
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  const user = await auth.isAuthenticated(request, {
    failureRedirect: route("/create/account"),
  })

  // Check if the user has a project in progress
  let project = await db.project.findFirst({
    where: {
      status: "Draft",
      userId: user.id,
    },
  })

  if (project) {
    await db.project.update({
      data: {
        intendedUse: submission.value.intendedUse,
        name: submission.value.name,
      },
      where: { id: project.id, userId: user.id },
    })
  } else {
    project = await db.project.create({
      data: {
        intendedUse: submission.value.intendedUse,
        name: submission.value.name,
        userId: user.id,
      },
    })
  }

  return redirect(route("/create/:projectId", { projectId: project.id }))
}

export function HydrateFallback() {
  // TODO(adelrodriguez): Add a loading state
  return <div>Loading...</div>
}

export default function Route() {
  const { storedData } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    defaultValue: storedData,
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
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
          Tell us about your writing
        </h1>
        <h2 className="mt-4 text-2xl font-light text-gray-600">
          We don&apos;t save your text; everything is stored locally on your
          computer
        </h2>
      </div>
      <div>
        <label
          htmlFor={fields.name.id}
          className="block text-sm font-medium leading-6 text-gray-900"
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
      </div>
      <div className="rounded-xl bg-slate-800 p-6">
        <label
          htmlFor={fields.text.id}
          className="block text-sm font-medium leading-6 text-white"
        >
          Add your text
        </label>
        <div className="mt-2">
          <textarea
            {...getInputProps(fields.text, { type: "text" })}
            rows={4}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
              <div key={intendedUse} className="flex items-center">
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
        type="submit"
        className="mt-4 rounded-lg bg-slate-900 p-4 text-white hover:bg-slate-700"
      >
        Choose an art style
      </button>
    </Form>
  )
}
