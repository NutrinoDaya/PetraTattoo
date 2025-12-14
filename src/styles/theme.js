import { normalize } from '../utils/responsive';

// Color palette - Dark Yellow and Black Tattoo Shop Theme
export const colors = {
  // Dark theme base (pure black)
  background: '#0a0a0a',
  surface: '#1a1a1a',
  card: '#1a1a1a',
  
  // Primary colors (gold/dark yellow for accents)
  primary: '#d4af37',      // Rich gold/dark yellow
  primaryLight: '#e5c158', // Lighter gold
  primaryDark: '#b8941d',  // Darker gold
  
  // Secondary colors (dark gold accent)
  secondary: '#c9a961',    // Muted gold
  secondaryLight: '#e0c074',
  secondaryDark: '#9d7e3c',
  
  // Text colors
  text: '#f5f5f5',         // Off-white
  textSecondary: '#cccccc', // Light gray
  textMuted: '#888888',    // Medium gray
  
  // Status colors
  success: '#2d5016',      // Dark green (status badge)
  warning: '#8b7500',      // Dark yellow (status badge)
  error: '#8b0000',        // Dark red (status badge)
  info: '#003d5c',         // Dark blue
  
  // UI colors
  border: '#333333',       // Dark gray borders
  divider: '#2a2a2a',      // Dark dividers
  shadow: '#000000',       // Black shadow
  
  // Gradient colors
  gradientStart: '#d4af37',
  gradientEnd: '#9d7e3c',
  
  // Chart colors (dark yellow themed)
  chartColors: ['#d4af37', '#c9a961', '#b8941d', '#9d7e3c', '#8b7500', '#6b5a0f'],
};

export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(16),
  lg: normalize(24),
  xl: normalize(32),
  xxl: normalize(48),
};

export const typography = {
  h1: {
    fontSize: normalize(32),
    fontWeight: '700',
    color: colors.text,
  },
  h2: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: colors.text,
  },
  h3: {
    fontSize: normalize(24),
    fontWeight: '600',
    color: colors.text,
  },
  h4: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: normalize(16),
    fontWeight: '400',
    color: colors.text,
  },
  bodySecondary: {
    fontSize: normalize(16),
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: colors.textMuted,
  },
  button: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: colors.text,
  },
};

export const borderRadius = {
  sm: normalize(4),
  md: normalize(8),
  lg: normalize(12),
  xl: normalize(16),
  round: normalize(50),
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};