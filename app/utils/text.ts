const DRAFT_PROJECT_KEY = "draft-project"

/**
 * Store the text in local storage
 */
export function saveText(text: string, projectKey = DRAFT_PROJECT_KEY) {
  localStorage.setItem(projectKey, text)
}

/**
 * Get the text from local storage
 */
export function getSavedText(projectKey = DRAFT_PROJECT_KEY): string | null {
  return localStorage.getItem(projectKey)
}

/**
 * Remove the text from local storage
 */
export function removeSavedText(projectKey = DRAFT_PROJECT_KEY) {
  localStorage.removeItem(projectKey)
}
