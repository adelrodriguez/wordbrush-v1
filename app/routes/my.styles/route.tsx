import { Button } from "@nextui-org/react"
import { useLoaderData, useRevalidator } from "@remix-run/react"
import { posthog } from "posthog-js"

export function clientLoader() {
  const hasAlreadyVoted = localStorage.getItem("custom-style-vote")

  return { hasAlreadyVoted: !!hasAlreadyVoted }
}

clientLoader.hydrate = true

export function HydrateFallback() {
  return null
}

export default function Route() {
  const { hasAlreadyVoted } = useLoaderData<typeof clientLoader>()
  const revalidator = useRevalidator()

  if (hasAlreadyVoted) {
    return (
      <div className="flex max-w-xl flex-col space-y-4">
        <p>Coming soon!</p>

        <p>Thanks for letting me know you want this made!</p>
      </div>
    )
  }

  return (
    <div className="flex max-w-xl flex-col space-y-4">
      <p>Coming soon!</p>
      <p>
        If you like the product and want to use this as soon as possible, click
        the button below and to let me know you want this feature:
      </p>
      <Button
        className="rounded-2xl bg-gray-900 text-white hover:bg-gray-800"
        onClick={() => {
          posthog.capture("clicked_wants_custom_styles")
          localStorage.setItem("custom-style-vote", "true")
          revalidator.revalidate()
        }}
      >
        I want this!
      </Button>
    </div>
  )
}
