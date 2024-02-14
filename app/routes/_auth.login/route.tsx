import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Button, Input } from "@nextui-org/react"
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
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

  return (
    <div className="flex flex-col gap-y-2">
      {authError && (
        <Alert title="There was an error" type="error">
          {authError.message}
        </Alert>
      )}
      <Form {...getFormProps(form)} className="space-y-6" method="POST">
        <div className="mt-2">
          <Input
            {...getInputProps(fields.email, { type: "email" })}
            autoComplete="email"
            description="If you don't have an account, we'll create one for you."
            errorMessage={fields.email.errors}
            isInvalid={!!fields.email.errors}
            label="Email"
            required
            variant="bordered"
          />
        </div>

        <Button
          className="bg-gray-900 text-white hover:bg-gray-800"
          fullWidth
          size="md"
          type="submit"
        >
          Sign in
        </Button>
      </Form>
    </div>
  )
}
