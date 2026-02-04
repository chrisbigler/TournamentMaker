export const colors = {
  // Brand accent - Forest Green (the ONE accent color)
  primary: '#059669',
  primaryLight: '#10B981',
  primaryDark: '#047857',
  
  // Secondary accents (for visual variety)
  accents: {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    amber: '#F59E0B',
    rose: '#F43F5E',
    cyan: '#06B6D4',
  },
  
  // Semantic colors (used sparingly)
  semantic: {
    success: '#059669',       // Same as primary
    warning: '#F59E0B',       // Amber (warmer)
    error: '#EF4444',         // Red (brighter)
    info: '#3B82F6',          // Blue
  },
  
  // Light mode palette
  light: {
    background: {
      primary: '#FFFFFF',     // Main background
      secondary: '#FAFAFA',   // Subtle elevation (cards)
      tertiary: '#F5F5F5',    // Grouped sections
    },
    border: {
      subtle: '#E5E5E5',      // Hairlines
      default: '#D4D4D4',     // Inputs, cards
      strong: '#A3A3A3',      // Emphasis
    },
    text: {
      primary: '#171717',     // Headlines
      secondary: '#525252',   // Body text
      tertiary: '#737373',    // Captions, placeholders
      disabled: '#A3A3A3',    // Disabled states
      inverse: '#FFFFFF',     // Text on dark/colored backgrounds
    },
    // Convenience aliases
    surface: '#FFFFFF',
    card: '#FFFFFF',
    notification: '#059669',
  },
  
  // Dark mode palette
  dark: {
    background: {
      primary: '#0A0A0A',     // Main background (near black)
      secondary: '#171717',   // Subtle elevation (cards)
      tertiary: '#262626',    // Grouped sections
    },
    border: {
      subtle: '#262626',      // Hairlines
      default: '#404040',     // Inputs, cards
      strong: '#525252',      // Emphasis
    },
    text: {
      primary: '#FAFAFA',     // Headlines
      secondary: '#D4D4D4',   // Body text
      tertiary: '#A3A3A3',    // Captions, placeholders
      disabled: '#525252',    // Disabled states
      inverse: '#171717',     // Text on light backgrounds
    },
    // Convenience aliases
    surface: '#171717',
    card: '#171717',
    notification: '#10B981',
  },
  
  // Legacy color mappings (for backward compatibility during transition)
  // These map to the new system and can be removed once migration is complete
  legacy: {
    deepNavy: '#171717',          // Maps to text.primary
    electricBlue: '#059669',      // Maps to primary (now green)
    slateGray: '#525252',         // Maps to text.secondary
    pureWhite: '#FFFFFF',         // Maps to background.primary
    coolGray: '#FAFAFA',          // Maps to background.secondary
    lightGray: '#F5F5F5',         // Maps to background.tertiary
    richBlack: '#171717',         // Maps to text.primary
    darkGray: '#525252',          // Maps to text.secondary
    mediumGray: '#737373',        // Maps to text.tertiary
    successGreen: '#059669',      // Maps to semantic.success
    warningOrange: '#D97706',     // Maps to semantic.warning
    errorRed: '#DC2626',          // Maps to semantic.error
    infoBlue: '#0284C7',          // Maps to semantic.info
  },
} as const;

export const gradients = {
  // Primary gradient (subtle)
  primary: ['#059669', '#047857'],
  
  // Background gradients (very subtle)
  surfaceLight: ['#FFFFFF', '#FAFAFA'],
  surfaceDark: ['#171717', '#0A0A0A'],
  
  // Legacy gradients (for backward compatibility)
  primaryBlue: ['#059669', '#047857'],  // Now green
  forestGreen: ['#059669', '#047857'],
  navy: ['#171717', '#0A0A0A'],
  navyGradient: ['#171717', '#0A0A0A', '#262626'],
  coolGray: ['#FAFAFA', '#F5F5F5'],
} as const;

export const shadows = {
  // New elevation system
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  low: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  high: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  
  // Legacy shadow mappings
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  hover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
