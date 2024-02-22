import { notAllowed, temporaryRedirect } from "~/utils/http.server"

export function loader() {
  return temporaryRedirect("/")
}

export function action() {
  return notAllowed()
}
