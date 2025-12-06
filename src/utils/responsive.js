import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions for standard mobile screen (e.g., iPhone 11 Pro / Galaxy S10)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const scale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Use a moderate scale for larger devices to avoid elements becoming too huge
const moderateScale = (size, factor = 0.5) => size + (scale * size - size) * factor;

export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  
  return (
    (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)) ||
    (SCREEN_WIDTH >= 768 && SCREEN_HEIGHT >= 1024)
  );
};

export const wp = (widthPercent) => {
  const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

export const hp = (heightPercent) => {
  const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

export const normalize = (size) => {
  if (isTablet()) {
    return size * 1.5; // Scale up more for tablets
  }
  return moderateScale(size);
};

export const getResponsiveValue = (mobileValue, tabletValue) => {
  return isTablet() ? tabletValue : mobileValue;
};

export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};
