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
    { title: "🎨 Wordbrush | Illustrate your ideas" },
    {
      content:
        "Elevate your content with stunning visuals created directly from your writing. Create beautiful images for your blog, social media, or novel in seconds.",
      name: "description",
    },
    {
      content:
        "Wordbrush, text to image converter, content visualization tool, blog post visualization, newsletter graphics creator, novel excerpt images, social media content enhancement, visual content creation, digital storytelling tools, creative content visuals, engaging visual content, visual storytelling application, article illustration tool, visual engagement for social media, text-based image generation, creative writing visuals, enhance digital content with visuals, image creation for bloggers, marketing content visuals, storytelling enhancement tool, visual content strategies, image generation from text, content creator tools, visual narrative development, online content beautification",
      name: "keywords",
    },
    {
      content: "text/html; charset=utf-8",
      httpEquiv: "Content-Type",
    },
    {
      content: "English",
      name: "language",
    },
    { content: "https://wordbrush.art", property: "og:url" },
    { content: "website", property: "og:type" },
    { content: "🎨 Wordbrush | Illustrate your ideas", property: "og:title" },
    {
      content:
        "Elevate your content with stunning visuals created directly from your writing. Create beautiful images for your blog, social media, or novel in seconds.",
      property: "og:description",
    },
    {
      content: "/assets/images/og.webp",
      property: "og:image",
    },
    { content: "summary_large_image", name: "twitter:card" },
    { content: "wordbrush.art", property: "twitter:domain" },
    { content: "https://wordbrush.art", property: "twitter:url" },
    { content: "🎨 Wordbrush | Illustrate your ideas", name: "twitter:title" },
    {
      content:
        "Elevate your content with stunning visuals created directly from your writing. Create beautiful images for your blog, social media, or novel in seconds.",
      name: "twitter:description",
    },
    {
      content: "/assets/images/og.webp",
      name: "twitter:image",
    },
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
    <html className="h-full scroll-smooth bg-white" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <script
          data-domain="wordbrush.art"
          defer
          src="https://plausible.io/js/script.js"
        />
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
