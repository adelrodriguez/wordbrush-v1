import { z } from "zod"

const EnvSchema = z.object({
  // Cloudflare
  CLOUDFLARE_ACCOUNT_ID: z.string(),

  CLOUDFLARE_R2_PUBLIC_URL: z.string(),
  // Database
  DATABASE_URL: z.string(),

  ENCRYPTION_SECRET: z.string(),

  LEMONSQUEEZY_SIGNING_SECRET: z.string(),

  // OpenAI
  OPENAI_API_KEY: z.string(),
  OPENAI_ORG_ID: z.string(),

  // Redis
  REDIS_URL: z.string(),

  // Resend
  RESEND_API_KEY: z.string(),

  // Session
  SESSION_SECRET: z.string(),

  // Storage Bucket
  STORAGE_ACCESS_KEY: z.string(),
  STORAGE_BUCKET: z.string(),
  STORAGE_SECRET: z.string(),
})

const result = EnvSchema.safeParse(process.env)

if (!result.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    ...Object.entries(result.error.format())
      .map(([name, value]) => {
        if ("_errors" in value) {
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
