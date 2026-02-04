export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
} as const;

// Tighter, more refined border radii
export const borderRadius = {
  none: 0,
  xs: 2,      // Tiny elements
  sm: 4,      // Inputs, small buttons
  md: 6,      // Cards, standard buttons
  lg: 8,      // Modals, larger containers
  xl: 12,     // Large cards (use sparingly)
  '2xl': 16,  // Very large elements (use sparingly)
  full: 9999, // Pills, avatars, circular elements
} as const;

export const dimensions = {
  buttonHeight: {
    sm: 32,
    md: 40,   // Reduced from 44
    lg: 48,   // Reduced from 56
  },
  inputHeight: {
    sm: 32,
    md: 40,   // Reduced from 44
    lg: 48,   // Reduced from 56
  },
  iconSize: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 28,
    xl: 36,
  },
  touchableMinSize: 44, // Accessibility minimum touch target
} as const;

// Animation timing tokens
export const animation = {
  fast: 100,      // Quick micro-interactions
  normal: 180,    // Standard transitions
  slow: 280,      // Elaborate animations
  spring: {
    damping: 15,
    stiffness: 150,
  },
} as const;
