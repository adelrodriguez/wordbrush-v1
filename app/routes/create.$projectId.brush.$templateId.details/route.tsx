import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
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

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { forbidden, notFound } from "~/utils/http.server"

const schema = z.object({
  detail: z.number().optional(),
  exclude: z.string().optional(),
  keyElements: z.string().optional(),
  mood: z.string().optional(),
})

export async function loader({ params }: LoaderFunctionArgs) {
  const { templateId } = zx.parseParams(
    params,
    z.object({ templateId: z.string() }),
  )
  const template = await db.template.findUnique({
    select: {
      exclude: true,
      keyElements: true,
      mood: true,
    },
    where: { id: templateId },
  })

  if (!template) {
    throw notFound()
  }

  return json({ template })
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { projectId, templateId } = zx.parseParams(
    params,
    z.object({ projectId: z.string(), templateId: z.string() }),
  )

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema })

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
        exclude: submission.value.exclude,
        keyElements: submission.value.keyElements,
        mood: submission.value.mood,
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
    route("/create/:projectId/brush/:templateId/submit", {
      projectId,
      templateId,
    }),
  )
}

export default function Route() {
  const { template } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    defaultValue: template,
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })

  return (
    <>
      <Form
        {...getFormProps(form)}
        className="flex min-h-screen flex-col justify-center gap-y-4 py-16"
        method="POST"
      >
        <div className="text-center">
          <h1 className="font-gray-900 text-5xl font-black">
            Finalize the details
          </h1>
          <h2 className="mt-4 text-2xl font-light text-gray-600">
            Some final details to help us generate the best art for your writing
          </h2>
        </div>
        <div className="rounded-xl bg-yellow-300 p-6">
          Tip: You can leave any of these fields blank if you&apos;re not sure
          what to put, but the more information you provide, the better we can
          tailor the art to your writing.
        </div>
        <div className="grid grid-cols-1 gap-x-2 md:grid-cols-3">
          <div>
            <label
              className="block text-sm font-medium leading-6 text-gray-900"
              htmlFor={fields.mood.id}
            >
              Mood
            </label>
            <div className="mt-2">
              <input
                {...getInputProps(fields.mood, { type: "text" })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Feel free to leave this blank"
              />
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium leading-6 text-gray-900"
              htmlFor={fields.keyElements.id}
            >
              Key Elements
            </label>
            <div className="mt-2">
              <textarea
                {...getInputProps(fields.keyElements, { type: "text" })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Feel free to leave this blank"
                rows={4}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium leading-6 text-gray-900"
              htmlFor={fields.exclude.id}
            >
              Anything to exclude?
            </label>
            <div className="mt-2">
              <textarea
                {...getInputProps(fields.exclude, { type: "text" })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Feel free to leave this blank"
                rows={4}
              />
            </div>
          </div>
        </div>
        <button
          className="mt-4 rounded-lg bg-slate-900 p-4 text-white hover:bg-slate-700"
          type="submit"
        >
          Show me the art ✨
        </button>
      </Form>
    </>
  )
}
