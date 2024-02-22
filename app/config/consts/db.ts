import type { AspectRatio, IntendedUse } from "@prisma/client"

export const aspectRatios = [
  "Square",
  "Landscape",
  "Portrait",
] as const satisfies AspectRatio[]

export const intendedUses = [
  "PersonalBlog",
  "CompanyBlog",
  "Newsletter",
  "SocialMedia",
  "BookCover",
  "BookInterior",
  "PodcastCover",
  "PodcastEpisode",
  "Other",
] as const satisfies IntendedUse[]
