import { Link, Outlet, useLocation } from "@remix-run/react"
import clsx from "clsx"
import { route } from "routes-gen"

export default function Route() {
  const location = useLocation()
  const isIndex = location.pathname === "/"

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <Link className="-m-1.5 p-1.5" to={route("/")}>
              <span
                className={clsx(
                  "font-headline text-xl md:text-3xl",
                  isIndex ? "text-white" : "text-black",
                )}
              >
                Wordbrush
              </span>
            </Link>
          </div>
          <div className="flex gap-x-12">
            <Link
              className={clsx(
                "text-sm font-semibold leading-6",
                isIndex ? "text-gray-200" : "text-black",
              )}
              to={route("/pricing")}
            >
              Pricing
            </Link>
            <Link
              className={clsx(
                "text-sm font-semibold leading-6",
                isIndex ? "text-gray-200" : "text-black",
              )}
              to={route("/login")}
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>
      <main className="h-full min-h-screen bg-white">
        <Outlet />
      </main>
      <footer></footer>
    </>
  )
}
