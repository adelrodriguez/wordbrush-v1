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

const footerLinks = [
  {
    links: [
      {
        label: "Support",
        to: "mailto:contact@wordbrush.art",
      },
      {
        label: "Pricing",
        to: route("/pricing"),
      },
      {
        label: "Log in",
        to: route("/login"),
      },
    ],
    title: "WORDBRUSH",
  },
  {
    links: [
      {
        label: "Privacy policy",
        to: route("/privacy"),
      },
      {
        label: "Terms of service",
        to: route("/terms"),
      },
    ],
    title: "LEGAL",
  },
  {
    links: [
      {
        label: "X (formerly Twitter)",
        to: "https://x.com/adeldotdo",
      },
    ],
    title: "MORE",
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
        className={clsx("min-h-screen", isIndex ? "bg-[#185353]" : "bg-white")}
      >
        <Outlet />
      </main>
      <footer className="mx-auto grid space-y-12 bg-gray-900 px-12 py-8 md:grid-cols-4 md:space-y-0 md:p-16">
        <div className="col-span-1 flex items-center">
          <img
            alt="Wordbrush"
            className="h-24"
            src="/assets/images/logo-white.png"
          />
        </div>
        {footerLinks.map((section, index) => (
          <div className="col-span-1 flex flex-col space-y-4" key={index}>
            <h2 className="text-xs font-black leading-6 text-white">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.links.map((link, index) => (
                <li key={index}>
                  <Link
                    className="text-xs font-semibold leading-6 text-gray-200 hover:underline"
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </>
  )
}
