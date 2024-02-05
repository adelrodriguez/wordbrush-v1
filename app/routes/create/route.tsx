import {
  getCollectionProps,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { ActionFunctionArgs, json } from "@remix-run/node"
import { Form } from "@remix-run/react"
import { z } from "zod"

import auth from "~/helpers/auth.server"
import ai from "~/services/openai.server"

const resolution = ["portrait", "landscape", "square"] as const

const intendedUses = [
  "blog",
  "newsletter",
  "social",
  "book cover",
  "book illustration",
  "other",
] as const

const artStyles = [
  "realistic",
  "cartoon",
  "abstract",
  "mosaic",
  "vector art",
  "vaporware",
] as const

export function generatePrompt(
  text: string,
  options: {
    artStyle: (typeof artStyles)[number]
    detail?: number
    exclude?: string
    intendedUse: (typeof intendedUses)[number]
    keyElements?: string
    mood?: string
  },
) {
  let prompt = `Your role is to help the user generate an image for DALL-E 3 from their provided text.
  1. The intended user of image will be is for ${options.intendedUse}; optimize it for this use case.
  2. The image WILL NOT include any text in it; DO NOT include text.
  3. You will respond with the image only, without any additional information.
  4. The provided prompt will specify that the art style is ${options.artStyle}.
  `

  if (options.keyElements) {
    prompt += `5. The image should include the following elements: ${options.keyElements}.`
  }

  if (options.detail) {
    prompt += `6. On a scale of 1 being a simple, minimalist and abstract image, and 5 being an extremely intricate and detailed, this image has a detail level of ${options.detail}.`
  }

  if (options.exclude) {
    prompt += `7. The image should not include the following elements: ${options.exclude}.`
  }

  if (options.mood) {
    prompt += `8. The mood of the image should be: ${options.mood}.`
  }

  return `Prompt: ${prompt}.
  
  Text: ${text}.`
}

function getSize(size: (typeof resolution)[number]) {
  switch (size) {
    case "landscape":
      return "1792x1024"
    case "portrait":
      return "1024x1792"
    case "square":
      return "1024x1024"
    default:
      return "1024x1024"
  }
}

const schema = z.object({
  text: z.string().min(1).max(100000000),
  intendedUse: z.enum(intendedUses),
  artStyle: z.enum(artStyles),
  resolution: z.enum(resolution),
  color: z.string().optional(),
  keyElements: z.string().optional(),
  mood: z.string().optional(),
  detail: z.coerce.number().default(3),
  exclude: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema,
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  await auth.isAuthenticated(request, { failureRedirect: "/login" })

  const response = await ai.images.generate({
    prompt: generatePrompt(submission.value.text, submission.value),
    model: "dall-e-3",
    quality: "standard",
    response_format: "url",
    size: getSize(submission.value.resolution),
  })

  console.log({ response: response.data[0] })

  return null
}

export default function Route() {
  // const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    // lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    shouldRevalidate: "onBlur",
  })

  console.log({ fields: fields.intendedUse })

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Create your image</h1>
      <Form {...getFormProps(form)} method="POST">
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
              {intendedUses.map((intendedUse) => (
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
        <div>
          <label
            className="text-base font-semibold text-gray-900"
            htmlFor={fields.artStyle.id}
          >
            Art Style
          </label>
          <p className="text-sm text-gray-500">
            What kind of style do you want?
          </p>
          <fieldset className="mt-4">
            <legend className="sr-only">Art Style</legend>
            <div className="space-y-4">
              {getCollectionProps(fields.artStyle, {
                type: "radio",
                options: artStyles as unknown as string[],
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
          <div>{fields.artStyle.errors}</div>
        </div>
        <div>
          <label
            className="text-base font-semibold text-gray-900"
            htmlFor={fields.resolution.id}
          >
            Resolution
          </label>
          <p className="text-sm text-gray-500">
            What resolution do you want for your image?
          </p>
          <fieldset className="mt-4">
            <legend className="sr-only">Resolution</legend>
            <div className="space-y-4">
              {resolution.map((resolution) => (
                <div key={resolution} className="flex items-center">
                  <input
                    {...getInputProps(fields.resolution, {
                      type: "radio",
                      value: resolution,
                    })}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    defaultChecked={
                      fields.resolution.initialValue === resolution
                    }
                  />
                  <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                    {resolution}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <div>{fields.resolution.errors}</div>
        </div>

        <div>
          <label
            htmlFor={fields.keyElements.id}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Key Elements
          </label>
          <div className="mt-2">
            <input
              {...getInputProps(fields.keyElements, { type: "text" })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Feel free to leave this blank"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor={fields.mood.id}
            className="block text-sm font-medium leading-6 text-gray-900"
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
            htmlFor={fields.mood.id}
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
        <div>
          <label
            htmlFor={fields.exclude.id}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Anything to exclude?
          </label>
          <div className="mt-2">
            <input
              {...getInputProps(fields.exclude, { type: "text" })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Feel free to leave this blank"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-slate-900 p-4 text-white hover:bg-slate-700"
        >
          Create Image
        </button>
      </Form>
    </main>
  )
}
