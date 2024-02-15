import { Button } from "@nextui-org/react"
import { IntendedUse } from "@prisma/client"
import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Form, Outlet } from "@remix-run/react"
import { route } from "routes-gen"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"

// const schema = z.object({
//   intendedUse: z.nativeEnum(IntendedUse),
//   name: z.string(),
//   text: z.string().min(1).max(100000000), // TODO(adelrodriguez): Add a max length
// })

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request)

  if (user) {
    const project = await db.project.create({
      data: {
        intendedUse: IntendedUse.PersonalBlog,
        name: "Untitled Project",
        userId: user.id,
      },
    })

    return redirect(route("/create/:projectId", { projectId: project.id }))
  }

  return null
}

export function action() {
  return redirect(route("/login"))
}

export default function Route() {
  return (
    <div>
      This is a marketing page
      <Form method="POST">
        <Button
          className="background-animated font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          fullWidth
          size="lg"
          type="submit"
        >
          Login to generate your first image 🎨
        </Button>
      </Form>
      <Outlet />
    </div>
  )
}
