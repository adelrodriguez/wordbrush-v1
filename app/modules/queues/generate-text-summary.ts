import { Processor } from "bullmq"

import { ONE_MONTH } from "~/config/consts"
import cache from "~/modules/cache.server"
import { createQueue } from "~/modules/queue.server"
import ai from "~/services/openai.server"

type QueueData = {
  text: string
  projectId: string
}

const processor: Processor<QueueData> = async (job) => {
  const text = job.data.text
  const projectId = job.data.projectId

  const response = await ai.chat.completions.create({
    messages: [
      {
        content:
          "You will summarize the provided text into a 500 character summary.",
        role: "system",
      },
      {
        content: text,
        role: "user",
      },
    ],
    model: "gpt-3.5-turbo-0125",
  })

  const summary = response.choices[0]?.message.content
  const promptTokens = response.usage?.prompt_tokens
  const responseTokens = response.usage?.completion_tokens
  const totalTokens = response.usage?.total_tokens

  if (!summary) {
    throw new Error("Failed to generate summary")
  }

  const cacheKey = `project:${projectId}:summary`
  await cache.set(cacheKey, summary, "EX", ONE_MONTH.inSeconds)

  await job.log(`Created summary: ${cacheKey}`)

  await job.log(`Prompt tokens: ${promptTokens}`)
  await job.log(`Response tokens: ${responseTokens}`)
  await job.log(`Total tokens: ${totalTokens}`)
}

export default createQueue("GENERATE_TEXT_SUMMARY", processor)
