export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,     // Slightly reduced from 16
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 28,    // Reduced from 32
    '5xl': 32,
  },
  
  fontWeights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeights: {
    xs: 14,
    sm: 18,
    base: 22,
    lg: 24,
    xl: 28,
    '2xl': 30,
    '3xl': 34,
    '4xl': 36,
    '5xl': 40,
  },
  
  letterSpacings: {
    tighter: -0.5,  // Display headings
    tight: -0.3,    // Headings
    normal: 0,      // Body text
    wide: 0.2,      // Labels, captions
    wider: 0.5,     // All caps, buttons
  },
} as const;

export const textStyles = {
  // Display (hero text)
  display: {
    fontSize: typography.fontSizes['5xl'],
    fontWeight: typography.fontWeights.bold,
    lineHeight: typography.lineHeights['5xl'],
    letterSpacing: typography.letterSpacings.tighter,
  },
  
  // Headings
  h1: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    lineHeight: typography.lineHeights['4xl'],
    letterSpacing: typography.letterSpacings.tight,
  },
  h2: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.semibold,
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
    fontWeight: typography.fontWeights.medium,
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
    fontWeight: typography.fontWeights.medium,
    lineHeight: typography.lineHeights.base,
    letterSpacing: typography.letterSpacings.wide,
  },
  buttonSmall: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    lineHeight: typography.lineHeights.sm,
    letterSpacing: typography.letterSpacings.wide,
  },
  buttonLarge: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    lineHeight: typography.lineHeights.lg,
    letterSpacing: typography.letterSpacings.wide,
  },
  
  // Overline (small caps style)
  overline: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    lineHeight: typography.lineHeights.xs,
    letterSpacing: typography.letterSpacings.wider,
    textTransform: 'uppercase' as const,
  },
} as const;
