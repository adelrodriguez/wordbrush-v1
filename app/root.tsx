import { NextUIProvider } from "@nextui-org/react"
import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useNavigate,
} from "@remix-run/react"
import { HoneypotProvider } from "remix-utils/honeypot/react"

import honeypot from "~/modules/honeypot.server"
import stylesheet from "~/styles/index.css"
import tailwind from "~/styles/tailwind.css"

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ href: cssBundleHref, rel: "stylesheet" }] : []),
  { href: tailwind, rel: "stylesheet" },
  { href: stylesheet, rel: "stylesheet" },
  { href: "https://fonts.googleapis.com", rel: "preconnect" },
  {
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
    // Inter
    rel: "stylesheet",
  },
]

export function loader() {
  return json({ honeypot: honeypot.getInputProps() })
}

export default function App() {
  const { honeypot } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <html className="h-full bg-white" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <NextUIProvider className="h-full" navigate={navigate}>
          <HoneypotProvider {...honeypot}>
            <Outlet />
          </HoneypotProvider>
        </NextUIProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
