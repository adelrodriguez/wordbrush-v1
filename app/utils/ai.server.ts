import type { ArtStyle, IntendedUse, Project, Template } from "@prisma/client"

function generateIntendedUsePromptElement(intendedUse: IntendedUse): string {
  switch (intendedUse) {
    case "PersonalBlog":
      return "Optimize the image for a personal blog; this means that the image must capture emotion and personality. It should also tell a story or convey a message, and feel authentic and relatable."
    case "CompanyBlog":
      return "Optimize the image for a company blog; this means that the image must be professional and polished. It should also be on-brand and visually appealing, while also being industry-relevant."
    case "Newsletter":
      return "Optimize the image for a newsletter; this means that the image must be engaging and informative. It should be complementary to the content, enhancing the reader's understanding and experience."
    case "SocialMedia":
      return "Optimize the image for social media; this means that the image must be eye-catching and shareable. It should be adaptable to different platforms and formats, and encourage engagement and interaction."
    case "BookCover":
      return "Optimize the image for a book cover; this means that it should represent the genre and tone of the book. It should be visually striking and memorable, and entice the reader to pick up the book. It should set the mood and atmosphere of the book, using color, lighting, and composition to evoke specific emotions or settings."
    case "BookInterior":
      return "Optimize the image for a book interior; this means that it should enhance or complement the text, helping to visualize concepts, settings, or characters described in the passage."
    case "PodcastCover":
      return "Optimize the image for a podcast cover; this means that it should develop an iconic image that represents the podcast’s theme or essence, making it recognizable at a glance. This image should be versatile enough to become synonymous with the podcast itself."
    case "PodcastEpisode":
      return "Optimize the image for a podcast episode; this means that is should reflect the specific theme, topic, or guest featured in the episode. It provides a visual teaser that complements the episode's content."
    default:
      return ""
  }
}

function generateArtStylePromptElement(artStyle: ArtStyle): string {
  return `The prompt should be in the art style of ${artStyle.prompt}, an style that evokes ideas of ${artStyle.keywords.join(", ")}.
  
  You will follow the art style's rules and guidelines.`
}

function generateDetailLevelPromptElement(detail: number | null): string {
  if (!detail) return ""

  return `On a scale of 1 being the most simple, minimalist and abstract image, and 100 being an extremely intricate, detailed and hyperreal, this image has a detail level of ${detail}.`
}

export function generatePrompt(
  options: {
    artStyle: ArtStyle
  } & Pick<Template, "detail" | "exclude" | "keyElements" | "mood"> &
    Pick<Project, "intendedUse">,
) {
  return `Act as a digital art curator with expertise in AI-generated images. Create innovative and intriguing prompts tailored DALL-E from text provided by the user. The prompts will push the boundaries of machine creativity.

  You will respond with a single prompt that will be used to generate an image.

  ${generateArtStylePromptElement(options.artStyle)}
  
  ${generateIntendedUsePromptElement(options.intendedUse)}

  ${generateDetailLevelPromptElement(options.detail)}

  ${options.mood ? `The mood of the image should be: ${options.mood}.` : ""}

  The image MUST CONTAIN the following elements: ${options.keyElements}. An image NOT containing these elements is UNACCEPTABLE.

  It should NOT CONTAIN the following elements: ${options.exclude}. An image containing these elements is UNACCEPTABLE.
  
  We are ONLY depicting the image, not the physical object where it will be published. This means that the image can be printed and displayed for the intended use.
  
  NO TEXT. NO WORD OR NUMBERS on the image.

  Again, you will respond with a single prompt that will be used to generate an image.
  `
}
