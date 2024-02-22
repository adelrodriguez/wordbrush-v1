import { json, redirect } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

/**
 * 202 Accepted
 */
export function accepted<T>({
  message = "The request was accepted.",
  title = "Accepted",
  ...props
}: { message?: string; title?: string } & T) {
  return json(
    { message, title, ...props },
    { status: StatusCodes.ACCEPTED, statusText: ReasonPhrases.ACCEPTED },
  )
}

/**
 * 204 No Content
 */
export function noContent() {
  return json(null, {
    status: StatusCodes.NO_CONTENT,
    statusText: ReasonPhrases.NO_CONTENT,
  })
}

/**
 * 307 Temporary Redirect
 */
export function temporaryRedirect(location: string) {
  return redirect(location, {
    headers: { Location: location },
    status: StatusCodes.TEMPORARY_REDIRECT,
    statusText: ReasonPhrases.TEMPORARY_REDIRECT,
  })
}

/**
 * 308 Permanent Redirect
 */
export function permanentRedirect(location: string) {
  return redirect(location, {
    headers: { Location: location },
    status: StatusCodes.PERMANENT_REDIRECT,
    statusText: ReasonPhrases.PERMANENT_REDIRECT,
  })
}

/**
 * 400 Bad Request
 */
export function badRequest({
  message = "The request was invalid.",
  title = "Bad Request",
} = {}) {
  return json(
    { message, title },
    { status: StatusCodes.BAD_REQUEST, statusText: ReasonPhrases.BAD_REQUEST },
  )
}

/**
 * 401 Unauthorized
 */
export function unauthorized({
  message = "You are not authorized to access this resource.",
  title = "Unauthorized",
} = {}) {
  return json(
    { message, title },
    {
      status: StatusCodes.UNAUTHORIZED,
      statusText: ReasonPhrases.UNAUTHORIZED,
    },
  )
}

/**
 * 403 Forbidden
 */
export function forbidden({
  message = "You are not allowed to access this resource.",
  title = "Forbidden",
} = {}) {
  return json(
    { message, title },
    { status: StatusCodes.FORBIDDEN, statusText: ReasonPhrases.FORBIDDEN },
  )
}

/**
 * 404 Not Found
 */
export function notFound({
  message = "The requested resource was not found.",
  title = "Not Found",
} = {}) {
  return json(
    { message: message, title },
    { status: StatusCodes.NOT_FOUND, statusText: ReasonPhrases.NOT_FOUND },
  )
}

/**
 * 405 Method Not Allowed
 */
export function notAllowed({
  message = "The request method is not allowed.",
  title = "Method Not Allowed",
} = {}) {
  return json(
    { message, title },
    {
      status: StatusCodes.METHOD_NOT_ALLOWED,
      statusText: ReasonPhrases.METHOD_NOT_ALLOWED,
    },
  )
}

/**
 * 422 Unprocessable Entity
 */
export function unprocessableEntity<T>({
  message = "The request was unprocessable.",
  title = "Unprocessable Entity",
  ...props
}: { message?: string; title?: string } & T) {
  return json(
    { message, title, ...props },
    {
      status: StatusCodes.UNPROCESSABLE_ENTITY,
      statusText: ReasonPhrases.UNPROCESSABLE_ENTITY,
    },
  )
}

/**
 * 500 Internal Server Error
 */
export function internalServerError({
  message = "An internal error ocurred.",
  title = "Internal Server Error",
} = {}) {
  return json(
    { message, title },
    {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
    },
  )
}

/**
 * 501 Not Implemented
 */
export function notImplemented({
  message = "The request was not implemented.",
  title = "Not Implemented",
} = {}) {
  return json(
    { message, title },
    {
      status: StatusCodes.NOT_IMPLEMENTED,
      statusText: ReasonPhrases.NOT_IMPLEMENTED,
    },
  )
}
