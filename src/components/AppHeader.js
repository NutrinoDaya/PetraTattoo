import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { normalize } from '../utils/responsive';
import PetraLogo from './PetraLogo';

const AppHeader = ({ 
  title, 
  showLogo = true,
  subtitle = null,
  style = {} 
}) => {
  const { width } = useWindowDimensions();
  const isTabletLayout = width >= 768;

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.contentRow, 
        isTabletLayout && styles.contentRowTablet
      ]}>
        {showLogo && (
          <View style={[
            styles.logoContainer,
            isTabletLayout && styles.logoContainerTablet
          ]}>
            <PetraLogo size={isTabletLayout ? "medium" : "small"} />
          </View>
        )}
        
        <View style={[
          styles.titleContainer,
          isTabletLayout && styles.titleContainerTablet
        ]}>
          {title && <Text style={[
            styles.title,
            isTabletLayout && styles.titleTablet
          ]}>{title}</Text>}
          {subtitle && <Text style={[
            styles.subtitle,
            isTabletLayout && styles.subtitleTablet
          ]}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contentRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  contentRowTablet: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoContainerTablet: {
    marginBottom: 0,
    marginRight: spacing.md,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 0,
  },
  titleContainerTablet: {
    flex: 1,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  titleTablet: {
    fontSize: normalize(28),
  },
  subtitle: {
    fontSize: normalize(16),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitleTablet: {
    fontSize: normalize(18),
  },
});

export default AppHeader;