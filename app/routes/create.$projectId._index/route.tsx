import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { PaintBrushIcon } from "@heroicons/react/24/outline"
import { Button, Input, Textarea } from "@nextui-org/react"
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

import {
  FieldTitle,
  IntendedUsePicker,
  WorkflowBreadcrumbs,
} from "~/components/create"
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

  const template = await db.template.findFirst({
    where: { projectId },
    select: { id: true },
  })

  return json({ project, template })
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const { project, template } = await serverLoader<typeof loader>()

  return { project, text: getSavedText(project.id), template }
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
  const { project, text, template } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    defaultValue: {
      intendedUse: project.intendedUse,
      name: project.name === "Untitled Project" ? "" : project.name,
      text,
    },
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    shouldRevalidate: "onBlur",
  })

  return (
    <>
      <div className="flex items-center justify-start pt-8">
        <WorkflowBreadcrumbs projectId={project.id} templateId={template?.id} />
      </div>
      <Form
        {...getFormProps(form)}
        className="flex min-h-screen flex-col justify-center gap-y-4 pb-16 pt-8"
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

        <div className="mt-8">
          <Textarea
            {...getInputProps(fields.text, { type: "text" })}
            placeholder="Enter your book, article, or story here"
            className="w-full"
            variant="bordered"
            errorMessage={fields.text.errors}
            isInvalid={!!fields.text.errors}
            size="lg"
          />
        </div>

        <div className="mt-8 flex flex-col gap-y-4">
          <FieldTitle description="Where are you publishing your writing?">
            Intended Use
          </FieldTitle>
          <IntendedUsePicker
            {...getInputProps(fields.intendedUse, { type: "text" })}
          />
        </div>

        <div className="mt-8 flex flex-col gap-y-4">
          <FieldTitle description="Maybe the title of your piece?">
            Choose a name for this project
          </FieldTitle>
          <Input
            {...getInputProps(fields.name, { type: "text" })}
            placeholder="Untitled Project"
            variant="bordered"
            errorMessage={fields.name.errors}
            isInvalid={!!fields.name.errors}
            size="lg"
          />
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            className="bg-gray-900 p-8 text-white hover:bg-gray-800"
            fullWidth
            type="submit"
          >
            <PaintBrushIcon className="h-5 w-5" />
            Now let's choose an art style
          </Button>
        </div>
      </Form>
    </>
  )
}
