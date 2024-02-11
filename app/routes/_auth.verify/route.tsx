import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"

import Alert from "~/components/Alert"
import auth from "~/helpers/auth.server"
import { commitSession, getSession } from "~/helpers/session.server"

const schema = z.object({
  code: z.string().length(6),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.isAuthenticated(request, {
    successRedirect: route("/my"),
  })

  const cookie = await getSession(request.headers.get("cookie"))
  const authEmail = cookie.get("auth:email") as string
  const authError = cookie.get(auth.sessionErrorKey) as {
    message: string
  } | null

  if (!authEmail) return redirect(route("/login"))

  return json({ authEmail, authError } as const, {
    headers: {
      "set-cookie": await commitSession(cookie),
    },
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url)
  const currentPath = url.pathname

  await auth.authenticate("TOTP", request, {
    failureRedirect: currentPath,
    successRedirect: currentPath,
  })

  return null
}

export default function Route() {
  const { authEmail, authError } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    shouldRevalidate: "onBlur",
  })

  // TODO(adelrodriguez): Add alert component
  return (
    <div className="flex flex-col gap-y-4">
      {authError ? (
        <Alert title="There was an error" type="error">
          {authError.message}
        </Alert>
      ) : (
        <Alert title="Code sent!" type="info">
          We&apos;ve sent a code to {authEmail}. Please check your inbox.
        </Alert>
      )}
      <Form
        {...getFormProps(form)}
        action="#"
        className="space-y-6"
        method="POST"
      >
        <div>
          <label
            className="block text-sm font-medium leading-6 text-gray-900"
            htmlFor="email"
          >
            Code
          </label>
          <div className="mt-2">
            <input
              {...getInputProps(fields.code, { type: "text" })}
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
            <div className="mt-2 text-xs text-red-500">
              {fields.code.errors}
            </div>
          </div>
        </div>

        <div>
          <button
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            type="submit"
          >
            Sign in
          </button>
        </div>
      </Form>

      <Form
        autoComplete="off"
        className="flex w-full flex-col gap-2"
        method="POST"
      >
        <button
          // className="flex h-10 items-center justify-center rounded-md bg-gray-200 text-sm font-semibold text-black"
          className="flex w-full justify-center rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold leading-6 text-black shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          type="submit"
        >
          Request New Code
        </button>
      </Form>
    </div>
  )
}
