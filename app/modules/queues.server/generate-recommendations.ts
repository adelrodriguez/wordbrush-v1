import { Processor } from "bullmq"

import { ONE_MONTH } from "~/config/consts"
import cache from "~/modules/cache.server"
import db from "~/modules/db.server"
import { createQueue } from "~/modules/queue.server"
import ai from "~/services/openai.server"
import { getIntendedUseLabel } from "~/utils/project"

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

  const project = await db.project.findFirstOrThrow({
    select: { intendedUse: true },
    where: { id: projectId },
  })

  const artStyles = await db.artStyle.findMany({
    select: { name: true },
  })

  const response = await ai.chat.completions.create({
    messages: [
      {
        content: `You will provide 3 recommended art styles based on the provided summary.
        
        The available art styles are: ${artStyles.map((style) => style.name).join(", ")}.

        Take into account the intended use of the project: ${getIntendedUseLabel(project.intendedUse)}.
        
        Choose ONLY FROM THE AVAILABLE ART STYLES. You will answer with the exact names provided, do not translate or modify the names.
        
        You will answer with at least 3 art styles and at most 5. You will provide the names, separated by commas.`,
        role: "system",
      },
      {
        content: summary,
        role: "user",
      },
    ],
    model: "gpt-3.5-turbo-1106",
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
