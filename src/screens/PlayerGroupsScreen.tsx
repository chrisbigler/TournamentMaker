import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, PlayerGroup, SerializedPlayerGroup } from '../types';
import DatabaseService from '../services/DatabaseService';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { Button, ScreenHeader } from '../components';
import { MaterialIcons } from '@expo/vector-icons';

type PlayerGroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlayerGroups'>;

interface Props {
  navigation: PlayerGroupsScreenNavigationProp;
}

const PlayerGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const playerGroups = await DatabaseService.getAllPlayerGroups();
      setGroups(playerGroups);
    } catch (error) {
      Alert.alert('Error', 'Failed to load player groups');
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const renderGroup = ({ item }: { item: PlayerGroup }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('CreatePlayerGroup', { 
        group: {
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          players: item.players.map(player => ({
            ...player,
            createdAt: player.createdAt.toISOString(),
            updatedAt: player.updatedAt.toISOString(),
          }))
        } as SerializedPlayerGroup
      })}
      activeOpacity={0.7}>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <View style={styles.playerCountContainer}>
          <MaterialIcons name="people" size={14} color={theme.colors.primary} />
          <Text style={styles.playerCount}>{item.players.length} players</Text>
        </View>
        <Text style={styles.createdDate}>
          Created {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="group-work" size={48} color={theme.colors.primary} style={styles.emptyIcon} />
      <Text style={styles.emptyStateTitle}>No Player Groups</Text>
      <Text style={styles.emptyStateText}>
        Create player groups to quickly set up tournaments with the same people
      </Text>
      <Button
        title="Create First Group"
        onPress={() => navigation.navigate('CreatePlayerGroup', {})}
        variant="primary"
        size="md"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        variant="list"
        title="Player Groups"
        count={groups.length}
        onAdd={() => navigation.navigate('CreatePlayerGroup', {})}
        addLabel="+ New"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={groups.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    listContainer: {
      padding: theme.spacing.lg,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    groupCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.low,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    playerCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
      gap: 4,
    },
    playerCount: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.primary,
    },
    createdDate: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyStateTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    emptyStateText: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing['3xl'],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
    },
  });

export default PlayerGroupsScreen;
