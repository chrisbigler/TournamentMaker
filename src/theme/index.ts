export { colors, gradients, shadows } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, dimensions } from './spacing';

import { colors, shadows } from './colors';
import { textStyles } from './typography';
import { spacing, borderRadius, dimensions } from './spacing';

export const theme = {
  colors,
  shadows,
  textStyles,
  spacing,
  borderRadius,
  dimensions,
  
  // Common component styles - Updated for professional design
  components: {
    card: {
      backgroundColor: colors.background.coolGray,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.card,
    },
    button: {
      primary: {
        backgroundColor: colors.primary.electricBlue,
        borderRadius: borderRadius.lg,
        height: dimensions.buttonHeight.md,
        paddingHorizontal: spacing.xl,
        ...shadows.card,
      },
      secondary: {
        backgroundColor: colors.background.pureWhite,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: borderRadius.lg,
        height: dimensions.buttonHeight.md,
        paddingHorizontal: spacing.xl,
        ...shadows.card,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderRadius: borderRadius.lg,
        height: dimensions.buttonHeight.md,
        paddingHorizontal: spacing.xl,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary.electricBlue,
        borderRadius: borderRadius.lg,
        height: dimensions.buttonHeight.md,
        paddingHorizontal: spacing.xl,
      },
    },
    input: {
      backgroundColor: colors.background.pureWhite,
      borderWidth: 1,
      borderColor: colors.light.border,
      borderRadius: borderRadius.md,
      height: dimensions.inputHeight.md,
      paddingHorizontal: spacing.lg,
      fontSize: textStyles.body.fontSize,
    },
    header: {
      backgroundColor: colors.primary.deepNavy,
      height: 56,
      paddingHorizontal: spacing.lg,
      ...shadows.card,
    },
  },
} as const;

export type Theme = typeof theme; 