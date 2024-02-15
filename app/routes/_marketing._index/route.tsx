import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { route } from "routes-gen"

export const meta: MetaFunction = () => {
  return [
    { title: "Wordbrush" },
    { content: "Bring your words to life", name: "description" },
  ]
}

export default function Index() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-4 text-center">
      <h1 className="text-5xl font-black text-white">
        Bring your words to life
      </h1>
      <h2 className="mt-4 text-2xl font-light text-gray-300">
        Transform your writing into beautiful visuals to publish on your blog,
        your novel, and more.
      </h2>
      <Link className="background-animated text-white" to={route("/create")}>
        Create your first image 🪄
      </Link>
    </div>
  )
}
