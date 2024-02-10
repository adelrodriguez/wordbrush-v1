import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node"
import { Form, Link, useActionData } from "@remix-run/react"
import { AuthorizationError } from "remix-auth"
import { route } from "routes-gen"
import { z } from "zod"

import auth from "~/helpers/auth.server"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO(adelrodriguez): Check for error=true in the query string and display
  // an error message
  const user = await auth.isAuthenticated(request)

  if (user) {
    return redirect("/my")
  }

  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = await parseWithZod(formData, {
    async: true,
    schema,
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  try {
    await auth.authenticate("email-password", request, {
      context: { formData },
      successRedirect: "/my/words",
      throwOnError: true,
    })
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response) throw error

    // This is an authorization error, which means the user's credentials were
    // invalid
    if (error instanceof AuthorizationError) {
      return json(
        submission.reply({
          fieldErrors: {
            password: ["The email or password you entered is incorrect."],
          },
        }),
      )
    }
  }

  return null
}

export default function Route() {
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    shouldRevalidate: "onBlur",
  })

  return (
    <>
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
            <div className="mt-2 text-xs text-red-500">
              {fields.email.errors}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              className="block text-sm font-medium leading-6 text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="text-sm">
              <Link
                className="font-semibold text-indigo-600 hover:text-indigo-500"
                to="#"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="mt-2">
            <input
              {...getInputProps(fields.password, { type: "password" })}
              autoComplete="current-password"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
            <div className="mt-2 text-xs text-red-500">
              {fields.password.errors}
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

      <p className="mt-10 text-center text-sm text-gray-500">
        Not a member?{" "}
        <Link
          className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          to={route("/register")}
        >
          Register now
        </Link>
      </p>
    </>
  )
}
