import type { AspectRatio, Category } from "@prisma/client"

export function getImageSize(aspect?: AspectRatio | null) {
  switch (aspect) {
    case "Landscape":
      return "1792x1024" as const
    case "Portrait":
      return "1024x1792" as const
    case "Square":
    default:
      return "1024x1024" as const
  }
}

export function getStyle(
  category: Category | null,
  detail: number | null,
): "vivid" | "natural" {
  // If detail is set to >95, use natural style
  if (detail && detail > 95) {
    return "natural"
  }

  // Otherwise, use the category to determine the style
  switch (category) {
    case "Nature":
    case null:
      return "natural"
    default:
      return "vivid"
  }
}
