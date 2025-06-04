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
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
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
        return theme.colors.text.white;
      case 'secondary':
      case 'outline':
        return theme.colors.primary.electricBlue;
      case 'ghost':
        return theme.colors.primary.slateGray;
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
  
  // Variants - Updated for professional design
  primary: {
    backgroundColor: theme.colors.primary.electricBlue,
    ...theme.shadows.card,
  },
  secondary: {
    backgroundColor: theme.colors.background.pureWhite,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.card,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary.electricBlue,
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
  
  // Text styles - Updated for professional design
  text: {
    fontWeight: theme.textStyles.button.fontWeight,
    letterSpacing: theme.textStyles.button.letterSpacing,
  },
  primaryText: {
    color: theme.colors.text.white,
  },
  secondaryText: {
    color: theme.colors.primary.electricBlue,
  },
  ghostText: {
    color: theme.colors.primary.slateGray,
  },
  outlineText: {
    color: theme.colors.primary.electricBlue,
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