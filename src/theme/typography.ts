export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  fontWeights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 44,
    '5xl': 48,
  },
  
  letterSpacings: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    lineHeight: typography.lineHeights['4xl'],
    letterSpacing: typography.letterSpacings.tight,
  },
  h2: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    lineHeight: typography.lineHeights['3xl'],
    letterSpacing: typography.letterSpacings.tight,
  },
  h3: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.semibold,
    lineHeight: typography.lineHeights['2xl'],
    letterSpacing: typography.letterSpacings.normal,
  },
  h4: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    lineHeight: typography.lineHeights.xl,
    letterSpacing: typography.letterSpacings.normal,
  },
  
  // Body text
  body: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.normal,
    lineHeight: typography.lineHeights.base,
    letterSpacing: typography.letterSpacings.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.normal,
    lineHeight: typography.lineHeights.lg,
    letterSpacing: typography.letterSpacings.normal,
  },
  bodySmall: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.normal,
    lineHeight: typography.lineHeights.sm,
    letterSpacing: typography.letterSpacings.normal,
  },
  
  // Captions and labels
  caption: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.normal,
    lineHeight: typography.lineHeights.xs,
    letterSpacing: typography.letterSpacings.wide,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    lineHeight: typography.lineHeights.sm,
    letterSpacing: typography.letterSpacings.wide,
  },
  
  // Button text
  button: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    lineHeight: typography.lineHeights.base,
    letterSpacing: typography.letterSpacings.wide,
  },
  buttonLarge: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    lineHeight: typography.lineHeights.lg,
    letterSpacing: typography.letterSpacings.wide,
  },
} as const; 