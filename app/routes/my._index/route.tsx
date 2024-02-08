import { redirect } from "@remix-run/node"
import { route } from "routes-gen"

export function loader() {
  return redirect(route("/my/words"))
}
