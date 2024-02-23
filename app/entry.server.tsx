/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */
import type { EntryContext, HandleErrorFunction } from "@remix-run/node"
import { createReadableStreamFromReadable } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import { captureRemixServerException } from "@sentry/remix"
import { isbot } from "isbot"
import { PassThrough } from "node:stream"
import { renderToPipeableStream } from "react-dom/server"
import { createSitemapGenerator } from "remix-sitemap"

import "~/config/env.server"
import Sentry from "~/services/sentry"

export const handleError: HandleErrorFunction = (error, { request }) => {
  void captureRemixServerException(error, "remix.server", request)
  console.error(error)
}

const { isSitemapUrl, sitemap } = createSitemapGenerator({
  generateRobotsTxt: true,
  siteUrl: "https://wordbrush.art",
})

Sentry.init({
  dsn: "https://385ee7290c910c82fa78d52249ce8737@o4506764137922560.ingest.sentry.io/4506764141789184",
  tracesSampleRate: 1,
})

const ABORT_DELAY = 5_000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  if (isSitemapUrl(request)) {
    // @ts-expect-error - seems remixContext is not the type expected by sitemap
    return sitemap(request, remixContext)
  }

  return isbot(request.headers.get("user-agent") ?? "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { abort, pipe } = renderToPipeableStream(
      <RemixServer
        abortDelay={ABORT_DELAY}
        context={remixContext}
        url={request.url}
      />,
      {
        onAllReady() {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )

          pipe(body)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
        onShellError(error: unknown) {
          reject(error)
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { abort, pipe } = renderToPipeableStream(
      <RemixServer
        abortDelay={ABORT_DELAY}
        context={remixContext}
        url={request.url}
      />,
      {
        onError(error: unknown) {
          responseStatusCode = 500
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onShellReady() {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )

          pipe(body)
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
