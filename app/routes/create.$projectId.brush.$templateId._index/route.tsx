import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { Button } from "@nextui-org/react"
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

import {
  ArtStylePicker,
  AspectRatioPicker,
  DetailSlider,
  FieldTitle,
  WorkflowBreadcrumbs,
} from "~/components/create"
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
      id: true,
      projectId: true,
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
    <>
      <div className="flex items-center justify-center pt-8">
        <WorkflowBreadcrumbs
          projectId={template.projectId}
          templateId={template.id}
        />
      </div>
      <Form
        {...getFormProps(form)}
        className="flex flex-col justify-start gap-y-4 pb-16 pt-8"
        method="POST"
      >
        <div className="text-center">
          <h1 className="font-gray-900 text-5xl font-black">
            Stylize your words
          </h1>
          <h2 className="mt-4 text-2xl font-light text-gray-600">
            Choose a style, level of detail, and aspect ratio for your brush
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-y-4">
          <FieldTitle description="Don't know what to pick? We've chosen some suggestions for you.">
            Choose an art style
          </FieldTitle>
          <ArtStylePicker
            options={artStyles}
            {...getInputProps(fields.artStyleId, { type: "text" })}
          />
        </div>

        <div className="mt-8 flex flex-col gap-y-4">
          <FieldTitle>Choose an aspect ratio</FieldTitle>
          <AspectRatioPicker
            {...getInputProps(fields.aspectRatio, { type: "text" })}
          />
        </div>

        <div className="mt-8 flex flex-col gap-y-4">
          <FieldTitle description="To the left and the image will be minimalist and abstract; to the right and the image will be highly-detailed and realistic.">
            Choose the level of detail
          </FieldTitle>

          <DetailSlider {...getInputProps(fields.detail, { type: "number" })} />
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            className="bg-slate-900 p-8 text-white hover:bg-slate-800"
            fullWidth
            type="submit"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Let's finalize the details
          </Button>
        </div>
      </Form>
    </>
  )
}
