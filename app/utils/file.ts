export function parseFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.()]/g, "_")
}
