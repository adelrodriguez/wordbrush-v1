import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}

export default function Index() {
  return (
    <main>
      <h1>Illustrate your writing</h1>
      <h2>
        Turn your text into beautiful images to go along your blog post, your
        novel and more
      </h2>
      <Link to="/create">Create your first image</Link>
    </main>
  )
}
