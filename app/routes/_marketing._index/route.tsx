import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import db from "~/modules/db.server"

import CTA from "./CTA"
import Examples from "./Examples"
import FAQ from "./FAQ"
import Features from "./Features"
import Hero from "./Hero"
import Process from "./Process"
import Showcase from "./Showcase"

export async function loader() {
  const artStyles = await db.artStyle.findMany({
    select: { exampleUrl: true, id: true, name: true },
  })

  return json({ artStyles })
}

export default function Route() {
  const { artStyles } = useLoaderData<typeof loader>()

  return (
    <div className="bg-[#185353]">
      <Hero />
      <Features />
      <Showcase artStyles={artStyles} />
      <Process />
      <Examples />
      <FAQ />
      <CTA />
    </div>
  )
}
