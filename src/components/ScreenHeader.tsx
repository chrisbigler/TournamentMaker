import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

// Stat item for the 'create' variant
interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
}

// Action item for the 'detail' variant
interface ActionItem {
  icon: string;
  onPress: () => void;
  color?: string;
}

interface BaseProps {
  variant: 'create' | 'list' | 'detail';
}

interface CreateVariantProps extends BaseProps {
  variant: 'create';
  title: string;
  subtitle?: string;
  stats?: StatItem[];
  accentColor?: string;
}

interface ListVariantProps extends BaseProps {
  variant: 'list';
  title: string;
  count?: number;
  onAdd?: () => void;
  addLabel?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  rightAction?: React.ReactNode;
}

interface DetailVariantProps extends BaseProps {
  variant: 'detail';
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  actions?: ActionItem[];
}

type ScreenHeaderProps = CreateVariantProps | ListVariantProps | DetailVariantProps;

const ScreenHeader: React.FC<ScreenHeaderProps> = (props) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  if (props.variant === 'create') {
    return <CreateHeader {...props} theme={theme} styles={styles} />;
  }

  if (props.variant === 'list') {
    return <ListHeader {...props} theme={theme} styles={styles} />;
  }

  if (props.variant === 'detail') {
    return <DetailHeader {...props} theme={theme} styles={styles} />;
  }

  return null;
};

// Create variant - for creation flows
interface CreateHeaderInternalProps extends CreateVariantProps {
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

const CreateHeader: React.FC<CreateHeaderInternalProps> = ({
  title,
  subtitle,
  stats,
  accentColor,
  theme,
  styles,
}) => {
  const color = accentColor || theme.colors.primary;

  return (
    <View style={styles.createContainer}>
      <LinearGradient
        colors={[`${color}12`, `${color}06`, 'transparent']}
        style={styles.createGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.createContent}>
        <View style={styles.createTitleRow}>
          <View style={[styles.createIconContainer, { backgroundColor: `${color}15` }]}>
            <MaterialIcons name="add-circle-outline" size={24} color={color} />
          </View>
          <View style={styles.createTitleContainer}>
            <Text style={styles.createTitle}>{title}</Text>
            {subtitle && <Text style={styles.createSubtitle}>{subtitle}</Text>}
          </View>
        </View>

        {stats && stats.length > 0 && (
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                {stat.icon && (
                  <MaterialIcons
                    name={stat.icon as keyof typeof MaterialIcons.glyphMap}
                    size={14}
                    color={theme.colors.text.secondary}
                    style={styles.statIcon}
                  />
                )}
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// List variant - for list screens with search and add
interface ListHeaderInternalProps extends ListVariantProps {
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

const ListHeader: React.FC<ListHeaderInternalProps> = ({
  title,
  count,
  onAdd,
  addLabel = '+ Add',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  rightAction,
  theme,
  styles,
}) => {
  return (
    <View style={styles.listContainer}>
      {/* Title row */}
      <View style={styles.listTitleRow}>
        <Text style={styles.listTitle}>
          {title}
          {count !== undefined && (
            <Text style={styles.listCount}> ({count})</Text>
          )}
        </Text>
        {onAdd && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAdd}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>{addLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search row (optional) */}
      {onSearchChange && (
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons
              name="search"
              size={18}
              color={theme.colors.text.tertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchValue}
              onChangeText={onSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchValue && searchValue.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange('')}
                style={styles.clearButton}
              >
                <MaterialIcons
                  name="close"
                  size={16}
                  color={theme.colors.text.tertiary}
                />
              </TouchableOpacity>
            )}
          </View>
          {rightAction}
        </View>
      )}
    </View>
  );
};

// Detail variant - for detail/view screens
interface DetailHeaderInternalProps extends DetailVariantProps {
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}

const DetailHeader: React.FC<DetailHeaderInternalProps> = ({
  title,
  subtitle,
  breadcrumb,
  actions,
  theme,
  styles,
}) => {
  return (
    <View style={styles.detailContainer}>
      {breadcrumb && (
        <Text style={styles.breadcrumb}>{breadcrumb}</Text>
      )}
      <View style={styles.detailTitleRow}>
        <View style={styles.detailTitleContainer}>
          <Text style={styles.detailTitle}>{title}</Text>
          {subtitle && <Text style={styles.detailSubtitle}>{subtitle}</Text>}
        </View>
        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={action.icon as keyof typeof MaterialIcons.glyphMap}
                  size={20}
                  color={action.color || theme.colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // Create variant styles
    createContainer: {
      position: 'relative',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    createGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    createContent: {
      padding: theme.spacing.lg,
    },
    createTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    createIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    createTitleContainer: {
      flex: 1,
    },
    createTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.text.primary,
    },
    createSubtitle: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    statsContainer: {
      flexDirection: 'row',
      marginTop: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statIcon: {
      marginRight: 4,
    },
    statValue: {
      ...theme.textStyles.bodySmall,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginRight: 4,
    },
    statLabel: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.tertiary,
    },

    // List variant styles
    listContainer: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    listTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    listTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.text.primary,
    },
    listCount: {
      ...theme.textStyles.h4,
      color: theme.colors.text.tertiary,
      fontWeight: theme.typography.fontWeights.regular,
    },
    addButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
    },
    addButtonText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      borderRadius: theme.borderRadius.sm,
      height: 40,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...theme.textStyles.body,
      height: '100%',
      paddingVertical: 0,
      color: theme.colors.text.primary,
    },
    clearButton: {
      padding: 4,
    },

    // Detail variant styles
    detailContainer: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    breadcrumb: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.xs,
    },
    detailTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    detailTitleContainer: {
      flex: 1,
      marginRight: theme.spacing.lg,
    },
    detailTitle: {
      ...theme.textStyles.h3,
      color: theme.colors.text.primary,
    },
    detailSubtitle: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.secondary,
      marginTop: 4,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    actionButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background.secondary,
    },
  });

export default ScreenHeader;
