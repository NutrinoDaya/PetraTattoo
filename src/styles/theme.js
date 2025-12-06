import { normalize } from '../utils/responsive';

// Color palette inspired by the MMA design theme
export const colors = {
  // Dark theme base
  background: '#1a1a1a',
  surface: '#2a2a2a',
  card: '#333333',
  
  // Primary colors (bold orange/red for accents)
  primary: '#ff6b35',
  primaryLight: '#ff8c5a',
  primaryDark: '#e55a2b',
  
  // Secondary colors
  secondary: '#4a90e2',
  secondaryLight: '#6ba3e8',
  secondaryDark: '#3a7bc8',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#cccccc',
  textMuted: '#999999',
  
  // Status colors
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
  
  // UI colors
  border: '#444444',
  divider: '#555555',
  shadow: '#000000',
  
  // Gradient colors
  gradientStart: '#ff6b35',
  gradientEnd: '#e55a2b',
  
  // Chart colors
  chartColors: ['#ff6b35', '#4a90e2', '#28a745', '#ffc107', '#dc3545', '#17a2b8'],
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
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: normalize(28),
    fontWeight: 'bold',
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
    color: colors.text,
  },
  bodySecondary: {
    fontSize: normalize(16),
    color: colors.textSecondary,
  },
  caption: {
    fontSize: normalize(14),
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