import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface MenuItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  style?: ViewStyle;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  onPress,
  icon,
  variant = 'primary',
  style,
}) => {
  const menuItemStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  return (
    <TouchableOpacity
      style={menuItemStyle}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button">
      <View style={styles.content}>
        <View style={[styles.iconContainer, styles[`${variant}Icon`]]}>
          <MaterialIcons
            name={icon}
            size={theme.dimensions.iconSize.lg}
            color={variant === 'neutral' ? theme.colors.text.richBlack : theme.colors.text.white}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, styles[`${variant}Title`]]}>{title}</Text>
          <Text style={[styles.subtitle, styles[`${variant}Subtitle`]]}>{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  primary: {
    backgroundColor: theme.colors.primary.electricBlue,
  },
  secondary: {
    backgroundColor: theme.colors.primary.deepNavy,
  },
  accent: {
    backgroundColor: theme.colors.accent.infoBlue,
  },
  neutral: {
    backgroundColor: theme.colors.background.coolGray,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: theme.dimensions.iconSize.xl + theme.spacing.sm,
    height: theme.dimensions.iconSize.xl + theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
  },
  primaryIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  accentIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  neutralIcon: {
    backgroundColor: theme.colors.background.pureWhite,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.textStyles.h4,
    marginBottom: theme.spacing.xs,
  },
  primaryTitle: {
    color: theme.colors.text.white,
  },
  secondaryTitle: {
    color: theme.colors.text.white,
  },
  accentTitle: {
    color: theme.colors.text.white,
  },
  neutralTitle: {
    color: theme.colors.text.richBlack,
  },
  subtitle: {
    ...theme.textStyles.bodySmall,
    opacity: 0.9,
  },
  primarySubtitle: {
    color: theme.colors.text.white,
  },
  secondarySubtitle: {
    color: theme.colors.text.white,
  },
  accentSubtitle: {
    color: theme.colors.text.white,
  },
  neutralSubtitle: {
    color: theme.colors.text.darkGray,
  },
});

export default MenuItem; 