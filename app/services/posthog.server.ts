import crypto from "node:crypto"
import { PostHog } from "posthog-node"

import { POSTHOG_API_KEY } from "~/config/consts"

const posthog = new PostHog(POSTHOG_API_KEY, {
  host: "https://app.posthog.com",
})

export function getDistinctId(headers: Headers): string {
  const cookieString = headers.get("Cookie") ?? ""
  const cookieName = `ph_${POSTHOG_API_KEY}_posthog`
  const cookieMatch = cookieString.match(new RegExp(cookieName + "=([^;]+)"))
  let distinctId

  if (cookieMatch?.[1]) {
    const parsedValue = JSON.parse(decodeURIComponent(cookieMatch[1])) as {
      distinct_id?: string
    } | null

    if (parsedValue?.distinct_id) {
      distinctId = parsedValue.distinct_id
    } else {
      distinctId = crypto.randomUUID()
    }
  } else {
    distinctId = crypto.randomUUID()
  }

  return distinctId
}

export default posthog
