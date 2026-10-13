/**
 * Utility functions for web navigation
 */

/**
 * Navigate to a specific route
 * @param path The path to navigate to (e.g., '/login')
 */
export const navigateTo = (path: string): void => {
  window.location.href = path;
};

/**
 * Reload the current page
 */
export const reloadPage = (): void => {
  window.location.reload();
};

/**
 * Get the current path
 */
export const getCurrentPath = (): string => {
  return window.location.pathname;
};