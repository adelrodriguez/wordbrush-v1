import { Link } from "@remix-run/react"
import clsx from "clsx"
import { posthog } from "posthog-js"
import { route } from "routes-gen"

export default function Hero() {
  return (
    <section className="relative flex h-screen items-center justify-start bg-cover bg-right">
      <div
        className={clsx(
          "absolute inset-0",
          "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-1/6 after:w-full after:bg-gradient-to-t after:from-[#185353] after:to-transparent after:content-['']",
        )}
      >
        <img
          alt=""
          className="h-full w-full object-cover object-center"
          src="/assets/images/painting.webp"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gray-400 mix-blend-multiply transition-all md:bg-gray-200"
        />
      </div>
      <div className="z-10 m-auto px-4 sm:w-4/5">
        <div className="flex flex-col gap-y-10 text-center md:text-left">
          <div>
            <h1 className="font-headline mx-auto max-w-sm text-5xl !leading-tight text-white md:mx-0 md:max-w-md md:text-7xl">
              Bring your words to life
            </h1>
            <p className="mt-4 text-base font-light text-gray-200 sm:max-w-xl md:text-lg">
              Elevate your content with stunning visuals created directly from
              your writing. Create beautiful images for your blog, social media,
              or novel in seconds.
            </p>
          </div>
          <div>
            <Link
              className="background-animated rounded-xl px-10 py-3 font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              onClick={() => {
                posthog.capture("clicked_top_cta")
              }}
              to={route("/login")}
            >
              Create your first image ✨
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
