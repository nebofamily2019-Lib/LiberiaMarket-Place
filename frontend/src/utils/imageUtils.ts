/**
 * Utility for handling image URLs
 * Handles fallback between Cloudinary and local storage
 */

// Strip /api suffix — uploads are served at the server root, not under /api
const _rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = _rawApiUrl.replace(/\/api\/?$/, '');

export const getImageUrl = (path: string | undefined | null): string | undefined => {
  if (!path) return undefined;

  // If it's already a full URL (Cloudinary or external), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's a relative path (local storage), prepend API URL
  if (path.startsWith('/')) {
    // Remove trailing slash from API_URL if present to avoid double slashes
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${baseUrl}${path}`;
  }

  // Fallback for paths without leading slash
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${baseUrl}/${path}`;
};
