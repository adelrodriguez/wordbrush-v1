import { NextUIProvider } from "@nextui-org/react"
import type { LinksFunction, MetaFunction } from "@remix-run/node"
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useLocation,
  useNavigate,
  useRouteError,
} from "@remix-run/react"
import { captureRemixErrorBoundaryError } from "@sentry/remix"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { posthog } from "posthog-js"
import { useEffect } from "react"
import { HoneypotProvider } from "remix-utils/honeypot/react"

import honeypot from "~/modules/honeypot.server"
import stylesheet from "~/styles/index.css?url"
import tailwind from "~/styles/tailwind.css?url"

const queryClient = new QueryClient()

export const links: LinksFunction = () => [
  { href: tailwind, rel: "stylesheet" },
  { href: stylesheet, rel: "stylesheet" },
  { href: "https://fonts.googleapis.com", rel: "preconnect" },
  {
    // Inter and Abril Fatface
    href: "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
    rel: "stylesheet",
  },
]

export function loader() {
  return json({ honeypot: honeypot.getInputProps() })
}

export const meta: MetaFunction = () => {
  return [
    { title: "🎨 Wordbrush" },
    { content: "Bring your words to life", name: "description" },
  ]
}

export function ErrorBoundary() {
  const error = useRouteError()

  captureRemixErrorBoundaryError(error)

  return (
    <html className="h-full bg-white" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>🎨 Wordbrush | We encountered an error</title>
        <Links />
      </head>
      <body className="h-full">
        <div className="flex h-full flex-col items-center justify-center gap-y-6">
          <div className="text-center">
            <h1 className="text-5xl font-black leading-6 text-gray-800">
              We encountered an error
            </h1>
            <p className="mt-4 text-2xl font-light text-gray-400">
              We&apos;re sorry, something went wrong. Please try again later.
            </p>
          </div>
          <Link className="hover:underline" to="/">
            Go back home
          </Link>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { honeypot } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    posthog.capture("$pageview")
  }, [location])

  return (
    <html className="h-full bg-white" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <QueryClientProvider client={queryClient}>
          <NextUIProvider className="h-full" navigate={navigate}>
            <HoneypotProvider {...honeypot}>
              <Outlet />
            </HoneypotProvider>
          </NextUIProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
