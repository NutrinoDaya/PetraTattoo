import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './theme';
import { normalize, isTablet } from '../utils/responsive';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  responsiveContainer: {
    flex: 1,
    width: isTablet() ? '70%' : '100%',
    alignSelf: 'center',
    maxWidth: 800,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    ...shadows.medium,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: normalize(16),
    marginVertical: spacing.xs,
  },
  inputLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: normalize(14),
    marginTop: spacing.xs,
  },
  
  // Header styles
  header: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  headerTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  
  // List styles
  listItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.small,
  },
  
  // Status styles
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLive: {
    backgroundColor: colors.error,
  },
  statusUpcoming: {
    backgroundColor: colors.warning,
  },
  statusCompleted: {
    backgroundColor: colors.success,
  },
  
  // Typography
  title: typography.h1,
  subtitle: typography.h2,
  heading: typography.h3,
  subheading: typography.h4,
  body: typography.body,
  bodySecondary: typography.bodySecondary,
  caption: typography.caption,
  
  // Spacing utilities
  mb8: { marginBottom: spacing.sm },
  mb16: { marginBottom: spacing.md },
  mb24: { marginBottom: spacing.lg },
  mt8: { marginTop: spacing.sm },
  mt16: { marginTop: spacing.md },
  mt24: { marginTop: spacing.lg },
  p16: { padding: spacing.md },
  px16: { paddingHorizontal: spacing.md },
  py16: { paddingVertical: spacing.md },
  
  // Flex utilities
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  alignCenter: {
    alignItems: 'center',
  },
  
  // Gradient background
  gradientContainer: {
    flex: 1,
  },
  
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});