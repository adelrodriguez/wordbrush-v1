import { ArtStyle, Project, Template } from "@prisma/client"

export function generatePrompt(
  text: string,
  options: {
    artStyle: ArtStyle
  } & Pick<Template, "detail" | "exclude" | "keyElements" | "mood"> &
    Pick<Project, "intendedUse">,
) {
  let prompt = `You will create an image from the above text. You will obey the following rules:
  1. The intended user of image will be is for ${options.intendedUse}; optimize it for this use case.
  2. The image WILL NOT include any text in it; DO NOT include text.
  3. You will respond with the image only, without any additional information.
  4. The provided prompt will specify that the art style is ${options.artStyle.prompt}.
  `

  if (options.keyElements) {
    prompt += `5. The image should include the following elements: ${options.keyElements}.`
  }

  if (options.detail) {
    prompt += `6. On a scale of 1 being the most simple, minimalist and abstract image, and 100 being an extremely intricate and detailed, this image has a detail level of ${options.detail}.`
  }

  if (options.exclude) {
    prompt += `7. The image should not include the following elements: ${options.exclude}.`
  }

  if (options.mood) {
    prompt += `8. The mood of the image should be: ${options.mood}.`
  }

  prompt +=
    "Remember: DO NOT INCLUDE ANY TEXT. NO WORD OR NUMBERS on the image."

  return `${text}.
  
  ${prompt}`
}
