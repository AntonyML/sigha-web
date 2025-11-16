/**
 * Utility functions for navigation in Electron/Browser environments
 */

/**
 * Navigate to a specific route, handling both browser and Electron environments
 * @param path The path to navigate to (e.g., '/login')
 */
export const navigateTo = (path: string): void => {
  // Check if we're running in Electron (file protocol)
  if (window.location.protocol === 'file:') {
    // Use hash-based routing for Electron
    window.location.hash = path;
  } else {
    // Use regular navigation for browser
    window.location.href = path;
  }
};

/**
 * Reload the current page
 */
export const reloadPage = (): void => {
  window.location.reload();
};

/**
 * Get the current path, handling both hash and regular routing
 */
export const getCurrentPath = (): string => {
  if (window.location.protocol === 'file:') {
    // In Electron, use hash-based path
    return window.location.hash.substring(1) || '/';
  } else {
    // In browser, use pathname
    return window.location.pathname;
  }
};