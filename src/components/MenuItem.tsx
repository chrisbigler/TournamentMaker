import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

interface MenuItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  color?: string;
  showChevron?: boolean;
  style?: ViewStyle;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  onPress,
  icon,
  color,
  showChevron = true,
  style,
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
      duration: theme.animation.normal,
      useNativeDriver: true,
    }).start();
  };

  const accentColor = color || theme.colors.primary;

  return (
    <Animated.View 
      style={{ 
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.base, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button">
        <View style={styles.content}>
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
            <MaterialIcons
              name={icon}
              size={theme.dimensions.iconSize.md}
              color={accentColor}
            />
          </View>
          
          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          
          {/* Chevron */}
          {showChevron && (
            <MaterialIcons
              name="chevron-right"
              size={theme.dimensions.iconSize.md}
              color={theme.colors.text.tertiary}
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      ...theme.shadows.low,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderBottomLeftRadius: theme.borderRadius.lg,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    subtitle: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.tertiary,
    },
  });

export default MenuItem;
