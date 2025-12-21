import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get initial dimensions
let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Update dimensions on change (for orientation support)
Dimensions.addEventListener('change', ({ window }) => {
  SCREEN_WIDTH = window.width;
  SCREEN_HEIGHT = window.height;
});

// Base dimensions for standard mobile screen (e.g., iPhone 11 Pro / Galaxy S10)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Tablet breakpoint
const TABLET_BREAKPOINT = 768;

/**
 * Get current screen dimensions (dynamic)
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Check if current device is a tablet based on screen width
 * Uses dynamic dimensions to handle orientation changes
 */
export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  
  // A tablet typically has a minimum dimension of at least 600dp
  // and max dimension of at least 768dp
  if (minDimension >= 600 && maxDimension >= 768) {
    return true;
  }
  
  // Fallback: use pixel density calculation for edge cases
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = width * pixelDensity;
  const adjustedHeight = height * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  
  return (
    (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920))
  );
};

/**
 * Check if device is in landscape orientation
 */
export const isLandscape = () => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

/**
 * Get scale factor based on screen width
 */
const getScale = () => {
  const { width } = Dimensions.get('window');
  return width / BASE_WIDTH;
};

/**
 * Get vertical scale factor
 */
const getVerticalScale = () => {
  const { height } = Dimensions.get('window');
  return height / BASE_HEIGHT;
};

/**
 * Moderate scale for balanced sizing
 */
const moderateScale = (size, factor = 0.5) => {
  const scale = getScale();
  return size + (scale * size - size) * factor;
};

/**
 * Width percentage - returns pixels based on screen width percentage
 * @param {number} widthPercent - Percentage of screen width (0-100)
 */
export const wp = (widthPercent) => {
  const { width } = Dimensions.get('window');
  const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((width * elemWidth) / 100);
};

/**
 * Height percentage - returns pixels based on screen height percentage
 * @param {number} heightPercent - Percentage of screen height (0-100)
 */
export const hp = (heightPercent) => {
  const { height } = Dimensions.get('window');
  const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((height * elemHeight) / 100);
};

/**
 * Normalize size based on device type
 * Scales up for tablets, uses moderate scale for phones
 * @param {number} size - Base size in points
 */
export const normalize = (size) => {
  if (isTablet()) {
    // For tablets, scale up by 1.3x but cap it to avoid overly large elements
    const tabletScale = Math.min(getScale(), 1.5);
    return Math.round(size * tabletScale);
  }
  return Math.round(moderateScale(size));
};

/**
 * Get responsive value based on device type
 * @param {any} mobileValue - Value for phones
 * @param {any} tabletValue - Value for tablets
 */
export const getResponsiveValue = (mobileValue, tabletValue) => {
  return isTablet() ? tabletValue : mobileValue;
};

/**
 * Get responsive spacing
 * @param {number} baseSpacing - Base spacing value
 */
export const getResponsiveSpacing = (baseSpacing) => {
  if (isTablet()) {
    return baseSpacing * 1.5;
  }
  return baseSpacing;
};

/**
 * Get responsive font size
 * @param {number} baseFontSize - Base font size
 */
export const getResponsiveFontSize = (baseFontSize) => {
  if (isTablet()) {
    return Math.round(baseFontSize * 1.25);
  }
  return Math.round(moderateScale(baseFontSize, 0.3));
};

/**
 * Get responsive padding for containers
 */
export const getContainerPadding = () => {
  const { width } = Dimensions.get('window');
  if (width >= 1024) {
    return 48; // Large tablets / landscape
  } else if (width >= 768) {
    return 32; // Standard tablets
  } else if (width >= 480) {
    return 20; // Large phones
  }
  return 16; // Standard phones
};

/**
 * Get content max width for centering on large screens
 * Returns undefined for phones (full width)
 */
export const getContentMaxWidth = () => {
  const { width } = Dimensions.get('window');
  if (width >= 1200) {
    return 1000;
  } else if (width >= 1024) {
    return 900;
  } else if (width >= 768) {
    return width * 0.85;
  }
  return undefined; // Full width for phones
};

/**
 * Get number of columns for grid layouts
 */
export const getGridColumns = () => {
  const { width } = Dimensions.get('window');
  if (width >= 1024) {
    return 4;
  } else if (width >= 768) {
    return 3;
  } else if (width >= 480) {
    return 2;
  }
  return 2;
};

/**
 * Get touch target minimum size (for accessibility)
 */
export const getMinTouchTarget = () => {
  return isTablet() ? 56 : 44;
};

/**
 * Screen dimension constants (use sparingly, prefer dynamic functions)
 */
export const SCREEN_DIMENSIONS = {
  get width() { return Dimensions.get('window').width; },
  get height() { return Dimensions.get('window').height; },
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  PHONE_SMALL: 320,
  PHONE: 375,
  PHONE_LARGE: 480,
  TABLET: 768,
  TABLET_LARGE: 1024,
  DESKTOP: 1200,
};

/**
 * Get current breakpoint name
 */
export const getCurrentBreakpoint = () => {
  const { width } = Dimensions.get('window');
  if (width >= BREAKPOINTS.DESKTOP) return 'desktop';
  if (width >= BREAKPOINTS.TABLET_LARGE) return 'tablet-large';
  if (width >= BREAKPOINTS.TABLET) return 'tablet';
  if (width >= BREAKPOINTS.PHONE_LARGE) return 'phone-large';
  if (width >= BREAKPOINTS.PHONE) return 'phone';
  return 'phone-small';
};
