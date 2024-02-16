import { Processor } from "bullmq"

import { ONE_MONTH } from "~/config/consts"
import cache from "~/modules/cache.server"
import db from "~/modules/db.server"
import { createQueue } from "~/modules/queue.server"
import ai from "~/services/openai.server"

type QueueData = {
  projectId: string
}

const processor: Processor<QueueData> = async (job) => {
  const projectId = job.data.projectId
  const summaryKey = `project:${projectId}:summary`

  const summary = await cache.get(summaryKey)

  if (!summary) {
    throw new Error("Summary not found")
  }

  const artStyles = await db.artStyle.findMany({
    select: { name: true },
  })

  const response = await ai.chat.completions.create({
    messages: [
      {
        content: `You will provide 3 recommended art styles based on the provided summary.
        
        The available art styles are: ${artStyles.map((style) => style.name).join(", ")}.
        
        Choose ONLY FROM THE AVAILABLE ART STYLES.
        
        You will answer with the 3 art styles you recommend, separated by commas.`,
        role: "system",
      },
      {
        content: summary,
        role: "user",
      },
    ],
    model: "gpt-3.5-turbo-0125",
  })

  const recommendations = response.choices[0]?.message.content

  if (!recommendations) {
    throw new Error("Failed to generate recommendations")
  }

  await cache.set(
    `project:${projectId}:recommendations`,
    recommendations,
    "EX",
    ONE_MONTH.inSeconds,
  )

  await job.log(`Generated recommendations: ${recommendations}`)
}

export default createQueue("GENERATE_RECOMMENDATIONS", processor)
