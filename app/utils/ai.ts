import { ArtStyle, AspectRatio, Project } from "@prisma/client"

export function generatePrompt(
  text: string,
  options: {
    artStyle: ArtStyle
  } & Pick<
    Project,
    "intendedUse" | "detail" | "exclude" | "keyElements" | "mood"
  >,
) {
  let prompt = `Your role is to help the user generate an image for DALL-E 3 from their provided text.
  1. The intended user of image will be is for ${options.intendedUse}; optimize it for this use case.
  2. The image WILL NOT include any text in it; DO NOT include text.
  3. You will respond with the image only, without any additional information.
  4. The provided prompt will specify that the art style is ${options.artStyle.prompt}.
  `

  if (options.keyElements) {
    prompt += `5. The image should include the following elements: ${options.keyElements}.`
  }

  if (options.detail) {
    prompt += `6. On a scale of 1 being a simple, minimalist and abstract image, and 5 being an extremely intricate and detailed, this image has a detail level of ${options.detail}.`
  }

  if (options.exclude) {
    prompt += `7. The image should not include the following elements: ${options.exclude}.`
  }

  if (options.mood) {
    prompt += `8. The mood of the image should be: ${options.mood}.`
  }

  return `Prompt: ${prompt}.
  
  Text: ${text}.`
}

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
