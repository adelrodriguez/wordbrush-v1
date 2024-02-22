import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Button, Input, Textarea } from "@nextui-org/react"
import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
} from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"

import {
  ArtStylePicker,
  FieldTitle,
  IntendedUsePicker,
} from "~/components/create"
import {
  DRAFT_PROJECT_KEY,
  MAX_CHARACTER_LENGTH,
  intendedUses,
} from "~/config/consts"
import auth from "~/modules/auth.server"
import db from "~/modules/db.server"

const schema = z.object({
  artStyleId: z.string().optional(),
  intendedUse: z.enum(intendedUses).default("PersonalBlog"),
  name: z.string().default("My First Project"),
  text: z
    .string()
    .min(1)
    .max(MAX_CHARACTER_LENGTH)
    .default("A quick brown fox jumps over the lazy dog"),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request)

  if (user) {
    const project = await db.project.create({
      data: {
        intendedUse: "PersonalBlog",
        name: "Untitled Project",
        userId: user.id,
      },
    })

    return redirect(route("/create/:projectId", { projectId: project.id }))
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

  return { artStyles }
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const { artStyles } = await serverLoader<typeof loader>()
  const storedProject = localStorage.getItem(DRAFT_PROJECT_KEY) ?? "{}"
  const result = schema.safeParse(JSON.parse(storedProject))

  return { artStyles, project: result.success ? result.data : {} }
}

clientLoader.hydrate = true

export function action() {
  return redirect(route("/login"))
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const formData = await request.clone().formData()
  const submission = parseWithZod(formData, { schema })

  if (submission.status !== "success") {
    return submission.reply()
  }

  localStorage.setItem(DRAFT_PROJECT_KEY, JSON.stringify(submission.value))

  return serverAction<typeof action>()
}

export function HydrateFallback() {
  return (
    <div className="flex w-full flex-col gap-y-2 pt-8">
      <div className="h-4 animate-pulse rounded-md bg-gray-300" />

      <div className="h-12 w-full animate-pulse rounded-md bg-gray-300" />
      <div className="h-64 w-full animate-pulse rounded-md bg-gray-300" />
      <div className="h-36 w-full animate-pulse rounded-md bg-gray-300" />
      <div className="h-36 w-full animate-pulse rounded-md bg-gray-300" />
      <div className="h-36 w-full animate-pulse rounded-md bg-gray-300" />
    </div>
  )
}

export default function Route() {
  const { artStyles, project } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof clientAction>()
  const [form, fields] = useForm({
    defaultValue: {
      ...project,
    },
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    shouldRevalidate: "onBlur",
  })

  return (
    <div className="py-16">
      <Form
        {...getFormProps(form)}
        className="flex flex-col gap-y-6"
        method="POST"
      >
        <div className="text-center">
          <h1 className="font-gray-900 text-5xl font-black tracking-tight">
            Tell us about your writing
          </h1>
          <h2 className="mt-4 text-2xl font-light text-gray-600">
            We don&apos;t save your text; it&apos;s stored locally on your
            device
          </h2>
        </div>

        <div className="mt-8">
          <Textarea
            {...getInputProps(fields.text, { type: "text" })}
            className="w-full"
            errorMessage={fields.text.errors}
            isInvalid={!!fields.text.errors}
            placeholder="Enter your book, article, or story here"
            size="lg"
            variant="bordered"
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
            errorMessage={fields.name.errors}
            isInvalid={!!fields.name.errors}
            placeholder="Untitled Project"
            size="lg"
            variant="bordered"
          />
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

        <Button
          className="background-animated font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          fullWidth
          size="lg"
          type="submit"
        >
          Log in to continue 🎨
        </Button>
      </Form>
    </div>
  )
}
