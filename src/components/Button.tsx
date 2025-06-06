import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'tertiary':
      case 'destructive':
        return theme.colors.text.white;
      case 'outline':
        return theme.colors.action.primary;
      case 'ghost':
        return theme.colors.action.neutral;
      default:
        return theme.colors.text.white;
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
        />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    minHeight: theme.dimensions.touchableMinSize,
  },
  
  // Variants - Updated for varied professional design
  primary: {
    backgroundColor: theme.colors.action.primary, // Blue for primary actions
    ...theme.shadows.card,
  },
  secondary: {
    backgroundColor: theme.colors.action.secondary, // Green for secondary actions
    ...theme.shadows.card,
  },
  tertiary: {
    backgroundColor: theme.colors.action.tertiary, // Orange for tertiary actions
    ...theme.shadows.card,
  },
  destructive: {
    backgroundColor: theme.colors.action.destructive, // Red for destructive actions
    ...theme.shadows.card,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.action.neutral,
  },
  
  // Sizes
  sm: {
    height: theme.dimensions.buttonHeight.sm,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    height: theme.dimensions.buttonHeight.md,
    paddingHorizontal: theme.spacing.xl,
  },
  lg: {
    height: theme.dimensions.buttonHeight.lg,
    paddingHorizontal: theme.spacing['2xl'],
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles - Updated for varied professional design
  text: {
    fontWeight: theme.textStyles.button.fontWeight,
    letterSpacing: theme.textStyles.button.letterSpacing,
  },
  primaryText: {
    color: theme.colors.text.white,
  },
  secondaryText: {
    color: theme.colors.text.white,
  },
  tertiaryText: {
    color: theme.colors.text.white,
  },
  destructiveText: {
    color: theme.colors.text.white,
  },
  ghostText: {
    color: theme.colors.action.neutral,
  },
  outlineText: {
    color: theme.colors.action.neutral,
  },
  disabledText: {
    opacity: 0.7,
  },
  
  // Size-specific text
  smText: {
    fontSize: theme.textStyles.bodySmall.fontSize,
  },
  mdText: {
    fontSize: theme.textStyles.button.fontSize,
  },
  lgText: {
    fontSize: theme.textStyles.buttonLarge.fontSize,
  },
  });

export default Button; 