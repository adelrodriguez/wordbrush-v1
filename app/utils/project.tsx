import {
  BookOpenIcon,
  BookmarkIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  HandThumbUpIcon,
  MicrophoneIcon,
  PencilIcon,
  PhotoIcon,
  PlayIcon,
} from "@heroicons/react/24/outline"
import type { Category, IntendedUse } from "@prisma/client"

export function getIntendedUseIcon(
  intendedUse: IntendedUse,
  className?: string,
) {
  switch (intendedUse) {
    case "PersonalBlog":
      return <PencilIcon className={className} />
    case "CompanyBlog":
      return <BuildingOfficeIcon className={className} />
    case "BookCover":
      return <BookOpenIcon className={className} />
    case "BookInterior":
      return <BookmarkIcon className={className} />
    case "SocialMedia":
      return <HandThumbUpIcon className={className} />
    case "Newsletter":
      return <EnvelopeIcon className={className} />
    case "PodcastCover":
      return <MicrophoneIcon className={className} />
    case "PodcastEpisode":
      return <PlayIcon className={className} />
    case "Other":
      return <PhotoIcon className={className} />
    default:
      return null
  }
}

export function getIntendedUseLabel(intendedUse: IntendedUse) {
  switch (intendedUse) {
    case "PersonalBlog":
      return "Personal Blog"
    case "CompanyBlog":
      return "Company Blog"
    case "BookCover":
      return "Book Cover"
    case "BookInterior":
      return "Book Interior"
    case "SocialMedia":
      return "Social Media"
    case "Newsletter":
      return "Newsletter"
    case "PodcastCover":
      return "Podcast Cover"
    case "PodcastEpisode":
      return "Podcast Episode"
    case "Other":
      return "Other"
    default:
      return "Unknown"
  }
}

export function getCategoryEmoji(category: Category): string {
  switch (category) {
    case "Abstract":
      return "🎨"
    case "Digital":
      return "🖥️"
    case "Fantasy":
      return "🐉"
    case "Geometric":
      return "🔶"
    case "Historical":
      return "🏛️"
    case "Illustrative":
      return "🖌️"
    case "Modern":
      return "🏙️"
    case "Nature":
      return "🌿"
    case "SciFi":
      return "🚀"
    case "Technological":
      return "🔧"
    case "Traditional":
      return "🖼️"
    default:
      return ""
  }
}
