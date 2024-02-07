import { Outlet } from "@remix-run/react"

export default function Route() {
  return (
    <main className="mx-auto max-w-2xl">
      <Outlet />
    </main>
  )
}
