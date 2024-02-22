import type { AspectRatio, IntendedUse } from "@prisma/client"

export const aspectRatios = [
  "Square",
  "Landscape",
  "Portrait",
] as const satisfies AspectRatio[]

export const intendedUses = [
  "BookCover",
  "BookInterior",
  "CompanyBlog",
  "Newsletter",
  "Other",
  "PersonalBlog",
  "PodcastCover",
  "PodcastEpisode",
  "SocialMedia",
] as const satisfies IntendedUse[]
