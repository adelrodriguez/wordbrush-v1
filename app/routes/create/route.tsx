import { MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => [
  { title: "Create a new image | 🎨 Wordbrush" },
  { content: "Bring your words to life", name: "description" },
]

export default function Route() {
  return (
    <main className="mx-auto flex max-w-2xl justify-start">
      <Outlet />
    </main>
  )
}
