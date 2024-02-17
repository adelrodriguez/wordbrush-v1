import { Link, Outlet } from "@remix-run/react"
import { route } from "routes-gen"

export default function Route() {
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-start justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <Link className="-m-1.5 p-1.5" to={route("/")}>
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                className="h-16 w-auto"
                src="/assets/images/logo.png"
              />
            </Link>
          </div>
          <div className="flex gap-x-12">
            <Link
              className="text-sm font-semibold leading-6 text-gray-900"
              to={route("/pricing")}
            >
              Pricing
            </Link>
            <Link
              className="text-sm font-semibold leading-6 text-gray-900"
              to={route("/login")}
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>
      <main className="h-full min-h-screen">
        <Outlet />
      </main>
      <footer></footer>
    </>
  )
}
