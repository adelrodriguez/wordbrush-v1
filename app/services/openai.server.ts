import OpenAI from "openai"

import env from "~/config/env.server"

const ai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  organization: env.OPENAI_ORG_ID,
})

export default ai
