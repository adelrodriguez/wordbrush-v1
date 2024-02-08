import env from "./env.server"

export const isProduction = process.env.NODE_ENV === "production"

export const CLOUDFLARE_R2_ENDPOINT = `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
