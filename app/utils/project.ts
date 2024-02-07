import { Project } from "@prisma/client"

const DRAFT_PROJECT_KEY = "draft-project"

export function storeProjectLocally(formData: FormData) {
  // Check if the project is already stored
  const draftProject = localStorage.getItem(DRAFT_PROJECT_KEY)
  let project: Record<string, unknown> = {}

  if (draftProject) {
    // If the project is already stored, update the existing project with the new data
    project = { ...JSON.parse(draftProject) }
  }

  for (const [key, value] of formData.entries()) {
    project[key] = value
  }

  localStorage.setItem(DRAFT_PROJECT_KEY, JSON.stringify(project))
}

export function getLocalProject():
  | (Partial<Project> & { text: string })
  | null {
  const draftProject = localStorage.getItem(DRAFT_PROJECT_KEY)

  if (!draftProject) {
    return null
  }

  return JSON.parse(draftProject)
}

export function clearLocalProject() {
  localStorage.removeItem(DRAFT_PROJECT_KEY)
}
