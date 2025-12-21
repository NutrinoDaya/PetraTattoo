/**
 * useResponsive Hook
 * 
 * A React hook that provides responsive utilities that update dynamically
 * when screen dimensions change (e.g., on orientation change).
 * 
 * Usage:
 *   const { isTablet, isLandscape, wp, hp, normalize, dimensions } = useResponsive();
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

// Base dimensions for scaling (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Breakpoints
const BREAKPOINTS = {
  PHONE_SMALL: 320,
  PHONE: 375,
  PHONE_LARGE: 480,
  TABLET: 768,
  TABLET_LARGE: 1024,
  DESKTOP: 1200,
};

const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const { width, height } = dimensions;

  // Determine if device is tablet
  const isTablet = useMemo(() => {
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    if (minDimension >= 600 && maxDimension >= 768) {
      return true;
    }
    
    const pixelDensity = PixelRatio.get();
    const adjustedWidth = width * pixelDensity;
    const adjustedHeight = height * pixelDensity;
    
    if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
      return true;
    }
    
    return pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920);
  }, [width, height]);

  // Determine orientation
  const isLandscape = useMemo(() => width > height, [width, height]);
  const isPortrait = useMemo(() => height >= width, [width, height]);

  // Current breakpoint
  const breakpoint = useMemo(() => {
    if (width >= BREAKPOINTS.DESKTOP) return 'desktop';
    if (width >= BREAKPOINTS.TABLET_LARGE) return 'tablet-large';
    if (width >= BREAKPOINTS.TABLET) return 'tablet';
    if (width >= BREAKPOINTS.PHONE_LARGE) return 'phone-large';
    if (width >= BREAKPOINTS.PHONE) return 'phone';
    return 'phone-small';
  }, [width]);

  // Width percentage
  const wp = useCallback((widthPercent) => {
    const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel((width * elemWidth) / 100);
  }, [width]);

  // Height percentage
  const hp = useCallback((heightPercent) => {
    const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel((height * elemHeight) / 100);
  }, [height]);

  // Scale factor
  const scale = useMemo(() => width / BASE_WIDTH, [width]);

  // Moderate scale
  const moderateScale = useCallback((size, factor = 0.5) => {
    return size + (scale * size - size) * factor;
  }, [scale]);

  // Normalize size for current device
  const normalize = useCallback((size) => {
    if (isTablet) {
      const tabletScale = Math.min(scale, 1.5);
      return Math.round(size * tabletScale);
    }
    return Math.round(moderateScale(size));
  }, [isTablet, scale, moderateScale]);

  // Get responsive value based on device type
  const getResponsiveValue = useCallback((mobileValue, tabletValue) => {
    return isTablet ? tabletValue : mobileValue;
  }, [isTablet]);

  // Get container padding based on screen size
  const containerPadding = useMemo(() => {
    if (width >= 1024) return 48;
    if (width >= 768) return 32;
    if (width >= 480) return 20;
    return 16;
  }, [width]);

  // Get content max width for centering on large screens
  const contentMaxWidth = useMemo(() => {
    if (width >= 1200) return 1000;
    if (width >= 1024) return 900;
    if (width >= 768) return width * 0.85;
    return undefined;
  }, [width]);

  // Get number of columns for grids
  const gridColumns = useMemo(() => {
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    if (width >= 480) return 2;
    return 2;
  }, [width]);

  // Modal/form container width
  const modalWidth = useMemo(() => {
    if (width >= 1024) return Math.min(width * 0.5, 600);
    if (width >= 768) return Math.min(width * 0.7, 500);
    return width * 0.9;
  }, [width]);

  // Card width for grid layouts
  const cardWidth = useMemo(() => {
    const columns = gridColumns;
    const totalPadding = containerPadding * 2;
    const gap = isTablet ? 16 : 12;
    const totalGaps = gap * (columns - 1);
    return (width - totalPadding - totalGaps) / columns;
  }, [width, gridColumns, containerPadding, isTablet]);

  // Minimum touch target size (accessibility)
  const minTouchTarget = useMemo(() => isTablet ? 56 : 44, [isTablet]);

  // Responsive spacing multiplier
  const spacingMultiplier = useMemo(() => isTablet ? 1.5 : 1, [isTablet]);

  // Font size multiplier for tablets
  const fontMultiplier = useMemo(() => isTablet ? 1.15 : 1, [isTablet]);

  return {
    // Dimensions
    dimensions,
    width,
    height,
    
    // Device type
    isTablet,
    isLandscape,
    isPortrait,
    breakpoint,
    
    // Scaling functions
    wp,
    hp,
    normalize,
    moderateScale,
    getResponsiveValue,
    
    // Layout helpers
    containerPadding,
    contentMaxWidth,
    gridColumns,
    modalWidth,
    cardWidth,
    minTouchTarget,
    spacingMultiplier,
    fontMultiplier,
    
    // Constants
    BREAKPOINTS,
  };
};

export default useResponsive;
