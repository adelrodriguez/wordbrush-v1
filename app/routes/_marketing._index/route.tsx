import { Link } from "@remix-run/react"
import { route } from "routes-gen"

export default function Index() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-4 text-center">
      <div className="text-center">
        <h1 className="text-5xl font-black leading-6 text-gray-800">
          Bring your words to life
        </h1>
        <p className="mt-4 text-2xl font-light text-gray-400">
          Transform your writing into beautiful visuals to publish on your blog,
          your novel, and more.
        </p>
      </div>
      <Link
        className="background-animated rounded-xl px-12 py-4 text-xl font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
        to={route("/login")}
      >
        Create your first image ✨
      </Link>
    </div>
  )
}
