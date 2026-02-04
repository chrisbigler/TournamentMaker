import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'outlined';
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  containerStyle,
  variant = 'default',
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          styles[variant],
          isFocused && styles.focused,
          error && styles.error,
          style,
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.textStyles.label,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    input: {
      ...theme.components.input,
      color: theme.colors.text.primary,
    },
    default: {
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border.default,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border.strong,
      borderWidth: 1,
    },
    focused: {
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    error: {
      borderColor: theme.colors.semantic.error,
    },
    errorText: {
      ...theme.textStyles.caption,
      color: theme.colors.semantic.error,
      marginTop: theme.spacing.xs,
    },
  });

export default TextInput;
