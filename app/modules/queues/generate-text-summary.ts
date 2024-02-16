import { Processor } from "bullmq"
import crypto from "node:crypto"

import { ONE_MONTH } from "~/config/consts"
import cache from "~/modules/cache.server"
import { createQueue } from "~/modules/queue.server"
import { generateRecommendationsQueue } from "~/modules/queues"
import ai from "~/services/openai.server"

type QueueData = {
  text: string
  projectId: string
}

const processor: Processor<QueueData> = async (job) => {
  const text = job.data.text
  const projectId = job.data.projectId

  // Create a hash to avoid re-generating the summary if the text hasn't changed
  const hash = crypto.createHash("md5").update(text).digest("hex")

  const existingHash = await cache.get(`project:${projectId}:hash`)

  if (existingHash === hash) {
    await job.log(`Hash matches existing summary: project:${projectId}:hash`)
    return
  }

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

  const summaryKey = `project:${projectId}:summary`
  const hashKey = `project:${projectId}:hash`

  await Promise.all([
    cache.set(summaryKey, summary, "EX", ONE_MONTH.inSeconds),
    cache.set(hashKey, hash, "EX", ONE_MONTH.inSeconds),
    job.log(`Created summary: ${summaryKey}`),
    job.log(`Created hash: ${hashKey}`),
    job.log(`Prompt tokens: ${promptTokens}`),
    job.log(`Response tokens: ${responseTokens}`),
    job.log(`Total tokens: ${totalTokens}`),
  ])

  await generateRecommendationsQueue.add(projectId, {
    projectId,
  })
}

export default createQueue("GENERATE_TEXT_SUMMARY", processor)
