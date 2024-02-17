import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Button, Input } from "@nextui-org/react"
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { HoneypotInputs } from "remix-utils/honeypot/react"
import { SpamError } from "remix-utils/honeypot/server"
import { route } from "routes-gen"
import { z } from "zod"

import Alert from "~/components/Alert"
import auth from "~/modules/auth.server"
import honeypot from "~/modules/honeypot.server"
import { commitSession, getSession } from "~/modules/session.server"
import Sentry from "~/services/sentry"

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
  const formData = await request.clone().formData()

  try {
    honeypot.check(formData)
  } catch (error) {
    console.log(error)
    Sentry.captureException(error)

    if (error instanceof SpamError) {
      // If they're a bot, send them to a Rick Astley video.
      return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    }

    throw error
  }

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
        <HoneypotInputs label="Please leave this field blank" />
        <Input
          {...getInputProps(fields.code, { type: "text" })}
          autoComplete="one-time-code"
          errorMessage={fields.code.errors}
          isInvalid={!!fields.code.errors}
          label="Code"
          required
          variant="bordered"
        />

        <Button
          className="bg-gray-900 text-white hover:bg-gray-800"
          fullWidth
          size="md"
          type="submit"
        >
          Sign in
        </Button>
      </Form>

      <Form
        autoComplete="off"
        className="flex w-full flex-col gap-2"
        method="POST"
      >
        <HoneypotInputs label="Please leave this field blank" />
        <Button
          className="bg-gray-200 hover:bg-gray-300"
          fullWidth
          type="submit"
        >
          Request a new code
        </Button>
      </Form>
    </div>
  )
}
