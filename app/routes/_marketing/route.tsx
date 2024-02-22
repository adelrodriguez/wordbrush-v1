import { Link, Outlet, useLocation } from "@remix-run/react"
import clsx from "clsx"
import { route } from "routes-gen"

const navigationLinks = [
  {
    label: "Features",
    to: "/#features",
  },
  {
    label: "Styles",
    to: "/#styles",
  },
  {
    label: "How it works",
    to: "/#how-it-works",
  },
  {
    label: "Examples",
    to: "/#examples",
  },
  {
    label: "FAQ",
    to: "/#faq",
  },
  {
    label: "Pricing",
    to: route("/pricing"),
  },
]

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
                  "font-headline text-lg md:text-xl",
                  isIndex ? "text-white" : "text-black",
                )}
              >
                Wordbrush
              </span>
            </Link>
          </div>
          <div className="flex gap-x-12">
            {navigationLinks.map((link, index) => (
              <Link
                className={clsx(
                  "text-xs font-semibold leading-6 sm:text-sm",
                  isIndex ? "text-gray-200" : "text-black",
                  link.to !== route("/pricing") && "hidden lg:block",
                )}
                key={index}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className={clsx(
                "text-xs font-semibold leading-6 sm:text-sm",
                isIndex ? "text-gray-200" : "text-black",
              )}
              to={route("/login")}
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>
      <main
        className={clsx(
          "h-full min-h-screen",
          isIndex ? "bg-[#185353]" : "bg-white",
        )}
      >
        <Outlet />
      </main>
      <footer></footer>
    </>
  )
}
