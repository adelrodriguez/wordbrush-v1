import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import { route } from "routes-gen"
import { z } from "zod"

import Alert from "~/components/Alert"
import auth from "~/helpers/auth.server"
import { commitSession, getSession } from "~/helpers/session.server"

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.isAuthenticated(request, {
    successRedirect: route("/my"),
  })

  const cookie = await getSession(request.headers.get("Cookie"))
  const authEmail = cookie.get("auth:email") as string
  const authError = cookie.get(auth.sessionErrorKey) as {
    message: string
  } | null

  return json(
    { authEmail, authError },
    {
      headers: {
        "set-cookie": await commitSession(cookie),
      },
    },
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.clone().formData()
  const submission = parseWithZod(formData, {
    schema,
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  return await auth.authenticate("TOTP", request, {
    context: { formData },
    failureRedirect: route("/login"),
    successRedirect: route("/verify"),
  })
}

export default function Route() {
  const { authEmail, authError } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    defaultValue: { email: authEmail },
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    shouldRevalidate: "onBlur",
  })

  // TODO(adelrodriguez): Add alert component
  return (
    <div className="flex flex-col gap-y-2">
      {authError && (
        <Alert title="There was an error" type="error">
          {authError.message}
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
            Email address
          </label>
          <div className="mt-2">
            <input
              {...getInputProps(fields.email, { type: "email" })}
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
            <p
              className={clsx(
                "mt-2 text-sm ",
                fields.email.errors ? "text-red-500" : "text-gray-500",
              )}
            >
              {fields.email.errors
                ? fields.email.errors
                : "We'll send a code to this email address to verify your identity."}
            </p>
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
    </div>
  )
}
