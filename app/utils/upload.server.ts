import { PutObjectCommandInput } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { UploadHandler, writeAsyncIterableToWritable } from "@remix-run/node"
import { Buffer } from "node:buffer"
import { PassThrough } from "node:stream"

import env from "~/config/env.server"
import s3 from "~/services/s3.server"
import { parseFilename } from "~/utils/file"

export function convertBase64StringToBuffer(s: string): Buffer {
  return Buffer.from(s, "base64")
}

export async function uploadBuffer(
  b: Buffer,
  options: {
    key?: string
    contentType?: PutObjectCommandInput["ContentDisposition"]
    contentDisposition?: PutObjectCommandInput["ContentType"]
  },
): Promise<string | undefined> {
  const upload = new Upload({
    client: s3,
    params: {
      Body: b,
      Bucket: env.STORAGE_BUCKET,
      ContentDisposition: options.contentDisposition,
      ContentType: options.contentType,
      Key: options.key,
    },
  })

  const result = await upload.done()

  return result.Location
}

const uploadStream = ({
  ContentDisposition,
  ContentType,
  Key,
}: Pick<
  PutObjectCommandInput,
  "Key" | "ContentDisposition" | "ContentType"
>) => {
  const pass = new PassThrough()

  return {
    promise: new Upload({
      client: s3,
      params: {
        Body: pass,
        Bucket: env.STORAGE_BUCKET,
        ContentDisposition,
        ContentType,
        Key,
      },
    }).done(),
    writeStream: pass,
  }
}

export function createS3UploadHandler({
  contentDisposition,
  contentType,
  key,
}: {
  key?: string
  contentDisposition?: PutObjectCommandInput["ContentDisposition"]
  contentType?: PutObjectCommandInput["ContentType"]
} = {}): UploadHandler {
  return async ({ data, filename, name }) => {
    if (name !== "file") {
      return undefined
    }

    if (!filename) throw new Error("No filename provided")

    const stream = uploadStream({
      ContentDisposition: contentDisposition,
      ContentType: contentType,
      Key: key || parseFilename(filename),
    })

    await writeAsyncIterableToWritable(data, stream.writeStream)
    const file = await stream.promise

    const uploadedFileLocation = file.Location

    return uploadedFileLocation
  }
}
