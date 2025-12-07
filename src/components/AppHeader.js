import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors, spacing, typography } from '../styles/theme';
import { normalize, isTablet } from '../utils/responsive';
import PetraLogo from './PetraLogo';

const AppHeader = ({ 
  title, 
  showLogo = true,
  subtitle = null,
  style = {} 
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentRow}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <PetraLogo size="small" />
          </View>
        )}
        
        <View style={styles.titleContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
    flexDirection: isTablet() ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isTablet() ? 0 : spacing.sm,
    marginRight: isTablet() ? spacing.md : 0,
  },
  titleContainer: {
    alignItems: 'center',
    flex: isTablet() ? 1 : 0,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default AppHeader;