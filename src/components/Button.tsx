import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
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
  
  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: theme.animation.fast,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: theme.animation.fast,
      useNativeDriver: true,
    }).start();
  };

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
      case 'destructive':
        return '#FFFFFF';
      case 'secondary':
        return theme.colors.primary;
      case 'outline':
        return theme.colors.text.secondary;
      case 'ghost':
        return theme.colors.text.tertiary;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
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
    </Animated.View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      minHeight: theme.dimensions.touchableMinSize,
    },
    
    // Variants - Refined design
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    destructive: {
      backgroundColor: theme.colors.semantic.error,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    
    // Sizes
    sm: {
      height: theme.dimensions.buttonHeight.sm,
      paddingHorizontal: theme.spacing.md,
    },
    md: {
      height: theme.dimensions.buttonHeight.md,
      paddingHorizontal: theme.spacing.lg,
    },
    lg: {
      height: theme.dimensions.buttonHeight.lg,
      paddingHorizontal: theme.spacing.xl,
    },
    
    // States
    disabled: {
      opacity: 0.5,
    },
    
    // Text styles
    text: {
      fontWeight: theme.textStyles.button.fontWeight,
      letterSpacing: theme.textStyles.button.letterSpacing,
    },
    primaryText: {
      color: '#FFFFFF',
    },
    secondaryText: {
      color: theme.colors.primary,
    },
    destructiveText: {
      color: '#FFFFFF',
    },
    ghostText: {
      color: theme.colors.text.secondary,
    },
    outlineText: {
      color: theme.colors.text.primary,
    },
    disabledText: {
      opacity: 0.7,
    },
    
    // Size-specific text
    smText: {
      fontSize: theme.textStyles.buttonSmall.fontSize,
    },
    mdText: {
      fontSize: theme.textStyles.button.fontSize,
    },
    lgText: {
      fontSize: theme.textStyles.buttonLarge.fontSize,
    },
  });

export default Button;
