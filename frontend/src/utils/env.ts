/**
 * Environment configuration utilities
 * Provides consistent access to environment variables
 */

/**
 * Get the API base URL (without /api suffix)
 * Used for accessing static files like images
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  // Remove /api suffix to get base URL
  return apiUrl.replace(/\/api$/, '')
}

/**
 * Get the full API URL (with /api suffix)
 * Used for API requests
 */
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
}

/**
 * Build a full URL for an image path
 * @param path - Image path (e.g., "/uploads/image.jpg")
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  // If path is already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Build full URL with base
  const baseUrl = getApiBaseUrl()
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

/**
 * Get thumbnail URL from original image path
 * @param path - Original image path
 */
export const getThumbnailUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  const fullPath = getImageUrl(path)
  return fullPath.replace('-original', '-thumbnail')
}
