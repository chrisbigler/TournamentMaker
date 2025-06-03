export const colors = {
  // Core Brand Colors (ChatGPT inspired)
  primary: {
    deepNavy: '#202123',        // Dark header/background
    accentGreen: '#10A37F',     // Accent actions
    slateGray: '#40414F',       // Secondary elements
  },
  
  // Background Colors
  background: {
    pureWhite: '#FFFFFF',       // Main background
    coolGray: '#F7F7F8',        // Card backgrounds
    lightGray: '#E5E5EA',       // Section dividers
  },
  
  // Text Colors
  text: {
    richBlack: '#202123',       // Primary text
    darkGray: '#40414F',        // Secondary text
    mediumGray: '#6B7280',      // Placeholder text
    lightGray: '#9CA3AF',       // Disabled text
    white: '#FFFFFF',           // White text for dark backgrounds
  },
  
  // Accent Colors
  accent: {
    successGreen: '#10B981',    // Success states
    warningOrange: '#F59E0B',   // Warnings
    errorRed: '#EF4444',        // Errors
    infoBlue: '#0EA5E9',        // Information
  },
  
  // Legacy colors (kept for backward compatibility during transition)
  legacy: {
    sunbeamGold: '#F7C548',
    glassGreen: '#7FB069',
    skyBlue: '#87CEEB',
    warmWhite: '#FDFBF7',
    softGray: '#E8E5E0',
    stoneGray: '#9B9B93',
    charcoal: '#3A3A37',
  },
  
  // Light mode theme (ChatGPT inspired)
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#F7F7F8',
    text: {
      primary: '#202123',
      secondary: '#40414F',
      tertiary: '#6B7280',
      disabled: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    border: '#E5E5EA',
    notification: '#10A37F',
    primary: '#10A37F',
    secondary: '#40414F',
  },
  
  // Dark mode theme (ChatGPT inspired)
  dark: {
    background: '#343541',
    surface: '#202123',
    card: '#40414F',
    text: {
      primary: '#ECECF1',
      secondary: '#C5C5D2',
      tertiary: '#9CA3AF',
      disabled: '#6B7280',
      inverse: '#202123',
    },
    border: '#565869',
    notification: '#10A37F',
    primary: '#10A37F',
    secondary: '#ECECF1',
  },
} as const;

export const gradients = {
  // Gradients inspired by ChatGPT palette
  primaryGreen: ['#10A37F', '#19C37D'],
  navy: ['#343541', '#202123'],
  navyGradient: ['#343541', '#40414F', '#202123'],
  coolGray: ['#F7F7F8', '#E5E5EA'],
  
  // Legacy gradients (for backward compatibility)
  sunbeam: ['#F7C548', '#E6B439'],
  botanical: ['#7FB069', '#6A9A5B'],
  sky: ['#87CEEB', '#6BB6E0'],
  warm: ['#FDFBF7', '#F5F1E8'],
} as const;

export const shadows = {
  // Professional shadow system
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  hover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  
  // Legacy shadows (for backward compatibility)
  light: {
    shadowColor: '#3A3A37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#3A3A37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  heavy: {
    shadowColor: '#3A3A37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const; 