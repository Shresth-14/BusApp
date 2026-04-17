import { colors, elevation, radii, spacing, typography } from './tokens';

export const appTheme = {
  colors,
  spacing,
  radii,
  typography,
  elevation,
} as const;

export type AppTheme = typeof appTheme;
