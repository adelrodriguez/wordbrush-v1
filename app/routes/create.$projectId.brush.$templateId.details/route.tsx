import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { LightBulbIcon } from "@heroicons/react/24/outline"
import { Button, Input, Textarea } from "@nextui-org/react"
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

import { WorkflowBreadcrumbs } from "~/components/create"
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
      id: true,
      projectId: true,
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
      <div className="flex items-center justify-center pt-8">
        <WorkflowBreadcrumbs
          projectId={template.projectId}
          templateId={template.id}
        />
      </div>

      <Form
        {...getFormProps(form)}
        className="flex h-full min-h-screen flex-col justify-start gap-y-4 pb-16 pt-8"
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
        <div className="mt-8 flex rounded-xl bg-yellow-300 p-6">
          <p>
            <span className="font-bold">
              <LightBulbIcon className="mr-1 inline-block h-4 w-4" />
              Tip:{" "}
            </span>
            You can leave any of these fields blank if you&apos;re not sure what
            to put, but the more information you provide, the better we can
            tailor the art to your writing.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-y-6">
          <Input
            {...getInputProps(fields.mood, { type: "text" })}
            placeholder="Feel free to leave this blank"
            variant="bordered"
            label="Mood"
            description="What mood are you trying to convey with your writing?"
          />
          <div className="flex gap-x-4">
            <Textarea
              {...getInputProps(fields.keyElements, { type: "text" })}
              placeholder="Feel free to leave this blank"
              variant="bordered"
              label="Key Elements"
              description="Anything you want to make sure we include in the art?"
            />
            <Textarea
              {...getInputProps(fields.exclude, { type: "text" })}
              placeholder="Feel free to leave this blank"
              variant="bordered"
              label="Exclude"
              description="Anything you want to make sure we exclude from the art?"
            />
          </div>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            className="background-animated p-8 font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            fullWidth
            type="submit"
          >
            Show me the art ✨
          </Button>
        </div>
      </Form>
    </>
  )
}
