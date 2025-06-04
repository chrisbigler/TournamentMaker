export { colors, gradients, shadows } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, dimensions } from './spacing';
export { ThemeProvider, useTheme, useThemeMode } from './ThemeContext';
export { createTheme } from './createTheme';
export type { Theme, ThemeMode } from './createTheme';

import { createTheme } from './createTheme';

export const theme = createTheme('dark');
