/**
 * Theme utilities for the application
 */

export type Theme = 'matrix' | 'jarvis' | 'tactical';

/**
 * Get the primary color for a given theme
 */
export const getThemeColor = (theme: Theme): string => {
  if (theme === 'jarvis') return '#00FFFF';
  if (theme === 'tactical') return '#67df65';
  return '#39FF14'; // matrix
};

/**
 * Get the secondary/dim color for a given theme
 */
export const getThemeDimColor = (theme: Theme): string => {
  if (theme === 'jarvis') return '#0099CC';
  if (theme === 'tactical') return '#2ae500';
  return '#22AA44'; // matrix
};
