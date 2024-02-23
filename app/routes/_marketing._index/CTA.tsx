import { Link } from "@remix-run/react"
import { posthog } from "posthog-js"
import { route } from "routes-gen"

export default function CTA() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-y-10 px-6 py-48 md:px-8 md:py-64">
      <h2 className="font-headline text-3xl tracking-wide text-white sm:text-5xl sm:leading-tight">
        Ready to get started?
      </h2>
      <div>
        <Link
          className="background-animated rounded-xl px-10 py-3 font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          onClick={() => {
            posthog.capture("clicked_bottom_cta")
          }}
          to={route("/login")}
        >
          Create your first image ✨
        </Link>
      </div>
    </section>
  )
}
