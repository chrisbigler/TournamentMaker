export const colors = {
  // Core Brand Colors (New Professional Scheme)
  primary: {
    deepNavy: '#0F172A',        // Primary brand, headers
    electricBlue: '#3B82F6',    // Primary actions, CTAs
    slateGray: '#475569',       // Secondary elements
  },
  
  // Background Colors
  background: {
    pureWhite: '#FFFFFF',       // Main background
    coolGray: '#F8FAFC',        // Card backgrounds
    lightGray: '#F1F5F9',       // Section dividers
  },
  
  // Text Colors
  text: {
    richBlack: '#0F172A',       // Primary text
    darkGray: '#334155',        // Secondary text
    mediumGray: '#64748B',      // Placeholder text
    lightGray: '#94A3B8',       // Disabled text
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
  
  // Light mode theme (Updated to professional scheme)
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#F8FAFC',
    text: {
      primary: '#0F172A',
      secondary: '#334155',
      tertiary: '#64748B',
      disabled: '#94A3B8',
      inverse: '#FFFFFF',
    },
    border: '#F1F5F9',
    notification: '#3B82F6',
    primary: '#3B82F6',
    secondary: '#475569',
  },
  
  // Dark mode theme (Updated for consistency)
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    text: {
      primary: '#FFFFFF',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      disabled: '#64748B',
      inverse: '#0F172A',
    },
    border: '#475569',
    notification: '#3B82F6',
    primary: '#3B82F6',
    secondary: '#CBD5E1',
  },
} as const;

export const gradients = {
  // Updated gradients for professional look
  primaryBlue: ['#3B82F6', '#2563EB'],
  navy: ['#0F172A', '#1E293B'],
  navyGradient: ['#0F172A', '#1E293B', '#334155'], // Beautiful navy fade down gradient
  coolGray: ['#F8FAFC', '#F1F5F9'],
  
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