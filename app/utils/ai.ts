import { AspectRatio, Mode } from "@prisma/client"

export function getImageSize(aspect?: AspectRatio | null) {
  switch (aspect) {
    case AspectRatio.Landscape:
      return "1792x1024" as const
    case AspectRatio.Portrait:
      return "1024x1792" as const
    case AspectRatio.Square:
    default:
      return "1024x1024" as const
  }
}

export function getModeStyle(mode: Mode): "vivid" | "natural" {
  switch (mode) {
    case Mode.Vivid:
      return "vivid"
    case Mode.Natural:
    default:
      return "natural"
  }
}
