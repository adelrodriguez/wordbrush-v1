/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */
import { RemixBrowser, useLocation, useMatches } from "@remix-run/react"
import { browserTracingIntegration, replayIntegration } from "@sentry/remix"
import { posthog } from "posthog-js"
import { StrictMode, startTransition, useEffect } from "react"
import { hydrateRoot } from "react-dom/client"

import { POSTHOG_API_KEY } from "~/config/consts"
import Sentry from "~/services/sentry"

posthog.init(POSTHOG_API_KEY, {
  api_host: "https://app.posthog.com",
  capture_pageview: false,
})

Sentry.init({
  dsn: "https://385ee7290c910c82fa78d52249ce8737@o4506764137922560.ingest.sentry.io/4506764141789184",
  integrations: [
    browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches,
    }),
    replayIntegration(),
  ],
  replaysOnErrorSampleRate: 1,
  replaysSessionSampleRate: 0.1,

  tracesSampleRate: 1,
})

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  )
})
