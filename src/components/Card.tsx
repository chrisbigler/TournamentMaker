import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: theme.spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
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