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
import { IntendedUse } from "@prisma/client"

export function getIntendedUseIcon(
  intendedUse: IntendedUse,
  className?: string,
) {
  switch (intendedUse) {
    case IntendedUse.Personal:
      return <PencilIcon className={className} />
    case IntendedUse.Blog:
      return <BuildingOfficeIcon className={className} />
    case IntendedUse.BookCover:
      return <BookOpenIcon className={className} />
    case IntendedUse.BookInterior:
      return <BookmarkIcon className={className} />
    case IntendedUse.SocialMedia:
      return <HandThumbUpIcon className={className} />
    case IntendedUse.Newsletter:
      return <EnvelopeIcon className={className} />
    case IntendedUse.PodcastCover:
      return <MicrophoneIcon className={className} />
    case IntendedUse.PodcastEpisode:
      return <PlayIcon className={className} />
    case IntendedUse.Other:
      return <PhotoIcon className={className} />
    default:
      return null
  }
}
