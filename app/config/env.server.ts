import { z } from "zod"

const EnvSchema = z.object({
  DATABASE_URL: z.string(),

  REMIX_AUTH_SECRET: z.string(),

  OPENAI_API_KEY: z.string(),
  OPENAI_ORG_ID: z.string(),
})

const result = EnvSchema.safeParse(process.env)

if (!result.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:\n",
    ...Object.entries(result.error.format())
      .map(([name, value]) => {
        if (value && "_errors" in value) {
          return `${name}: ${value._errors.join(", ")}\n`
        }

        return null
      })
      .filter(Boolean),
  )

  throw new Error("You have invalid environment variables.")
}

const env = result.data

export default env
