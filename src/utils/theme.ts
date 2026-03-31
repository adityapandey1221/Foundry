/**
 * Theme utilities for the application
 */

export type Theme = 'matrix' | 'jarvis' | 'tactical' | 'video-exact';

/**
 * Get the primary color for a given theme
 */
export const getThemeColor = (theme: Theme): string => {
  if (theme === 'jarvis') return '#00FFFF';
  if (theme === 'tactical') return '#67df65';
  if (theme === 'video-exact') return '#5fb3ff';
  return '#39FF14'; // matrix
};

/**
 * Get the secondary/dim color for a given theme
 */
export const getThemeDimColor = (theme: Theme): string => {
  if (theme === 'jarvis') return '#0099CC';
  if (theme === 'tactical') return '#2ae500';
  if (theme === 'video-exact') return '#2d4a6f';
  return '#22AA44'; // matrix
};
