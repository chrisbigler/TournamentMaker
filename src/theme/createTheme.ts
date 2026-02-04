import { Platform } from 'react-native';
import { colors as baseColors, gradients, shadows } from './colors';
import { textStyles, typography } from './typography';
import { spacing, borderRadius, dimensions, animation } from './spacing';

export type ThemeMode = 'light' | 'dark';

export const createTheme = (mode: ThemeMode) => {
  const palette = mode === 'light' ? baseColors.light : baseColors.dark;
  const inputLineHeight = textStyles.body.lineHeight;
  const inputHeight = dimensions.inputHeight.md;
  const inputVerticalPadding = Math.max(
    0,
    Math.round((inputHeight - inputLineHeight) / 2) - (Platform.OS === 'ios' ? 2 : 0)
  );

  // Build the colors object with both new and legacy mappings
  const colors = {
    // Primary accent (these are the canonical color values)
    primary: baseColors.primary,
    primaryLight: baseColors.primaryLight,
    primaryDark: baseColors.primaryDark,
    
    // Semantic colors
    semantic: baseColors.semantic,
    
    // Current mode palette
    background: {
      ...palette.background,
      // Legacy aliases
      pureWhite: palette.background.primary,
      coolGray: palette.background.secondary,
      lightGray: palette.background.tertiary,
    },
    border: palette.border,
    text: {
      ...palette.text,
      // Legacy aliases
      richBlack: palette.text.primary,
      darkGray: palette.text.secondary,
      mediumGray: palette.text.tertiary,
      lightGray: palette.text.disabled,
      white: '#FFFFFF',
    },
    surface: palette.surface,
    card: palette.card,
    
    // Action colors (simplified)
    action: {
      primary: baseColors.primary,
      secondary: palette.text.secondary,
      destructive: baseColors.semantic.error,
      neutral: palette.text.tertiary,
    },
    
    // Accent colors (for compatibility)
    accent: {
      successGreen: baseColors.semantic.success,
      warningOrange: baseColors.semantic.warning,
      errorRed: baseColors.semantic.error,
      infoBlue: baseColors.semantic.info,
    },
    
    // Legacy color mappings (use new names above instead)
    // These can be removed once all screens are updated
    legacy: {
      deepNavy: palette.text.primary,
      electricBlue: baseColors.primary,
      slateGray: palette.text.secondary,
      forestGreen: baseColors.primary,
      warmOrange: baseColors.semantic.warning,
    },
    light: {
      border: palette.border.default,
      background: palette.background.primary,
      surface: palette.surface,
      card: palette.card,
      text: palette.text,
    },
    dark: baseColors.dark,
    selection: {
      primary: baseColors.primary,
      secondary: baseColors.primaryLight,
      active: baseColors.semantic.warning,
      highlight: baseColors.semantic.warning,
    },
  } as const;

  const theme = {
    mode,
    colors,
    gradients,
    shadows,
    textStyles,
    typography,
    spacing,
    borderRadius,
    dimensions,
    animation,

    // Component presets
    components: {
      card: {
        backgroundColor: palette.card,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: palette.border.subtle,
        padding: spacing.lg,
        ...shadows.low,
      },
      cardElevated: {
        backgroundColor: palette.card,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: palette.border.subtle,
        padding: spacing.lg,
        ...shadows.medium,
      },
      button: {
        primary: {
          backgroundColor: baseColors.primary,
          borderRadius: borderRadius.md,
          height: dimensions.buttonHeight.md,
          paddingHorizontal: spacing.lg,
        },
        secondary: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: baseColors.primary,
          borderRadius: borderRadius.md,
          height: dimensions.buttonHeight.md,
          paddingHorizontal: spacing.lg,
        },
        ghost: {
          backgroundColor: 'transparent',
          borderRadius: borderRadius.md,
          height: dimensions.buttonHeight.md,
          paddingHorizontal: spacing.lg,
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: palette.border.default,
          borderRadius: borderRadius.md,
          height: dimensions.buttonHeight.md,
          paddingHorizontal: spacing.lg,
        },
      },
      input: {
        backgroundColor: palette.background.primary,
        borderWidth: 1,
        borderColor: palette.border.default,
        borderRadius: borderRadius.sm,
        height: dimensions.inputHeight.md,
        paddingVertical: inputVerticalPadding,
        paddingHorizontal: spacing.md,
        fontSize: textStyles.body.fontSize,
        lineHeight: inputLineHeight,
        textAlignVertical: 'center',
      },
      inputFocused: {
        borderColor: baseColors.primary,
        borderWidth: 1,
      },
      header: {
        backgroundColor: palette.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: palette.border.subtle,
        height: 56,
        paddingHorizontal: spacing.lg,
      },
      tabBar: {
        backgroundColor: palette.background.primary,
        borderTopWidth: 1,
        borderTopColor: palette.border.subtle,
        height: 56,
      },
    },
  } as const;

  return theme;
};

export type Theme = ReturnType<typeof createTheme>;
