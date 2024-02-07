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
import { z } from "zod"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"

const clientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const serverSchema = z.object({
  email: z
    .string()
    .email()
    .refine(
      async (email) => {
        const exists = await db.user.count({ where: { email } })

        return exists !== 0
      },
      {
        message: "No account found for that email address",
      },
    ),
})

export async function loader({ request }: LoaderFunctionArgs) {
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
    schema: serverSchema,
  })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  try {
    return await auth.authenticate("email-password", request, {
      context: { formData },
      successRedirect: "/create",
      throwOnError: true,
    })
  } catch (error) {
    if (error instanceof Response) return error

    if (error instanceof AuthorizationError) {
      return json(
        submission.reply({
          fieldErrors: {
            password: ["The password you entered is incorrect."],
          },
        }),
      )
    }
    return null
  }
}

export default function Route() {
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: clientSchema }),
    shouldRevalidate: "onBlur",
  })

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form
          {...getFormProps(form)}
          className="space-y-6"
          action="#"
          method="POST"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                {...getInputProps(fields.email, { type: "email" })}
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="mt-2 text-sm text-red-500">
                {fields.email.errors}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="text-sm">
                <Link
                  to="#"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                {...getInputProps(fields.password, { type: "password" })}
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="mt-2 text-sm text-red-500">
                {fields.password.errors}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </Form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{" "}
          <Link
            to="#"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Start a 14 day free trial
          </Link>
        </p>
      </div>
    </div>
  )
}
