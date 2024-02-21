import { Link } from "@remix-run/react"
import clsx from "clsx"
import { route } from "routes-gen"

export default function Index() {
  return (
    <>
      <div className="relative flex h-full items-center justify-start bg-[#185353] bg-cover bg-right">
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
        <div className="z-10 m-auto w-4/5">
          <div className="flex flex-col gap-y-10 text-center md:text-left">
            <div>
              <h1 className="font-headline text-7xl leading-tight text-white">
                Bring your
                <br /> words to life
              </h1>
              <p className="mt-4 max-w-xl text-lg font-light text-gray-200">
                Elevate your content with stunning visuals created directly from
                your writing. Create beautiful images for your blog, social
                media, or novel in seconds.
              </p>
            </div>
            <div>
              <Link
                className="background-animated rounded-xl px-10 py-3 font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                to={route("/login")}
              >
                Create your first image ✨
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="h-screen bg-[#185353]" />
    </>
  )
}
