import { colors as baseColors, gradients, shadows } from './colors';
import { textStyles, typography } from './typography';
import { spacing, borderRadius, dimensions } from './spacing';

export type ThemeMode = 'light' | 'dark';

export const createTheme = (mode: ThemeMode) => {
  const palette = mode === 'light' ? baseColors.light : baseColors.dark;

  const colors = {
    ...baseColors,
    primary: {
      ...baseColors.primary,
      electricBlue: palette.primary,
    },
    background: {
      pureWhite: palette.background,
      coolGray: palette.card,
      lightGray: palette.surface,
    },
    text: {
      richBlack: palette.text.primary,
      darkGray: palette.text.secondary,
      mediumGray: palette.text.tertiary,
      lightGray: palette.text.disabled,
      white: baseColors.text.white,
    },
    light: {
      border: palette.border,
    },
  } as const;

  const theme = {
    colors,
    gradients,
    shadows,
    textStyles,
    typography,
    spacing,
    borderRadius,
    dimensions,

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

  return theme;
};

export type Theme = ReturnType<typeof createTheme>;
