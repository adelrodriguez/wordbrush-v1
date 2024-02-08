import { S3Client } from "@aws-sdk/client-s3"

import env from "~/config/env.server"
import { CLOUDFLARE_R2_ENDPOINT } from "~/config/vars"

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY,
    secretAccessKey: env.STORAGE_SECRET,
  },
  endpoint: CLOUDFLARE_R2_ENDPOINT,
  region: "auto",
})

export default s3
