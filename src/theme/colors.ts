export const colors = {
  // Core Brand Colors (Professional Design)
  primary: {
    deepNavy: '#0F172A',        // Primary brand, headers - from migration guide
    electricBlue: '#3B82F6',    // Primary actions, CTAs - from migration guide
    slateGray: '#475569',       // Secondary elements - from migration guide
    forestGreen: '#059669',     // Success actions, confirmations
    warmOrange: '#EA580C',      // Warning actions, important buttons
  },
  
  // Background Colors (Professional Light Theme)
  background: {
    pureWhite: '#FFFFFF',       // Main background - from migration guide
    coolGray: '#F8FAFC',        // Card backgrounds - from migration guide
    lightGray: '#F1F5F9',       // Section dividers - from migration guide
  },
  
  // Text Colors (Professional Design)
  text: {
    richBlack: '#0F172A',       // Primary text - from migration guide
    darkGray: '#334155',        // Secondary text - from migration guide
    mediumGray: '#64748B',      // Placeholder text - from migration guide
    lightGray: '#94A3B8',       // Disabled text - from migration guide
    white: '#FFFFFF',           // White text for dark backgrounds
  },
  
  // Action Colors (Varied Professional Design)
  action: {
    primary: '#3B82F6',         // Primary actions (create, start)
    secondary: '#059669',       // Secondary actions (save, confirm)
    tertiary: '#EA580C',        // Tertiary actions (edit, modify)
    destructive: '#EF4444',     // Destructive actions (delete, reset)
    neutral: '#475569',         // Neutral actions (cancel, back)
  },
  
  // Accent Colors (Professional Design)
  accent: {
    successGreen: '#10B981',    // Success states - from migration guide
    warningOrange: '#F59E0B',   // Warnings - from migration guide
    errorRed: '#EF4444',        // Errors - from migration guide
    infoBlue: '#0EA5E9',        // Information - from migration guide
    purpleAccent: '#8B5CF6',    // Special features, premium
  },
  
  // Selection States (Varied Colors)
  selection: {
    primary: '#059669',         // Primary selections (players, teams)
    secondary: '#8B5CF6',       // Secondary selections (modes, options)
    active: '#EA580C',          // Active states (current match, playing)
    highlight: '#F59E0B',       // Highlights (achievements, special)
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
  
  // Light mode theme (Professional style)
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
    border: '#E2E8F0',
    notification: '#3B82F6',
    primary: '#3B82F6',
    secondary: '#475569',
  },
  
  // Dark mode theme (Professional style)
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    text: {
      primary: '#F8FAFC',
      secondary: '#E2E8F0',
      tertiary: '#94A3B8',
      disabled: '#64748B',
      inverse: '#0F172A',
    },
    border: '#475569',
    notification: '#3B82F6',
    primary: '#3B82F6',
    secondary: '#E2E8F0',
  },
} as const;

export const gradients = {
  // Professional gradients
  primaryBlue: ['#3B82F6', '#2563EB'],        // Electric blue gradient
  forestGreen: ['#059669', '#047857'],        // Forest green gradient
  warmOrange: ['#EA580C', '#DC2626'],         // Warm orange gradient
  navy: ['#0F172A', '#1E293B'],               // Deep navy gradient
  navyGradient: ['#0F172A', '#1E293B', '#334155'], // Professional navy gradient
  coolGray: ['#F8FAFC', '#F1F5F9'],           // Cool gray gradient
  
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