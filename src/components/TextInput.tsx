import React from 'react';
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
  ...props
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          styles[variant],
          error && styles.error,
          style,
        ]}
        placeholderTextColor={theme.colors.text.mediumGray}
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
    color: theme.colors.text.richBlack,
    marginBottom: theme.spacing.sm,
  },
  input: {
    ...theme.components.input,
    color: theme.colors.text.richBlack,
  },
  default: {
    backgroundColor: theme.colors.background.pureWhite,
    borderColor: theme.colors.light.border,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary.electricBlue,
    borderWidth: 2,
  },
  error: {
    borderColor: theme.colors.accent.errorRed,
  },
  errorText: {
    ...theme.textStyles.caption,
    color: theme.colors.accent.errorRed,
    marginTop: theme.spacing.xs,
  },
  });

export default TextInput; 