import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { spacing } from '../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
  style?: StyleProp<ViewStyle>;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  style,
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: theme.spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.coolGray,
    borderRadius: theme.borderRadius.lg,
  },
  default: {
    ...theme.shadows.card,
  },
  elevated: {
    ...theme.shadows.elevated,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    backgroundColor: theme.colors.background.pureWhite,
  },
  });

export default Card; 