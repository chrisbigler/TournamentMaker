import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, PlayerGroup, Player, SerializedPlayerGroup } from '../types';
import DatabaseService from '../services/DatabaseService';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { Button, Card, ScreenHeader } from '../components';
import { MaterialIcons } from '@expo/vector-icons';

type CreatePlayerGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreatePlayerGroup'>;
type CreatePlayerGroupScreenRouteProp = RouteProp<RootStackParamList, 'CreatePlayerGroup'>;

interface Props {
  navigation: CreatePlayerGroupScreenNavigationProp;
  route: CreatePlayerGroupScreenRouteProp;
}

const CreatePlayerGroupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { group } = route.params || {};
  const isEditing = !!group;

  const initialPlayers: Player[] = group?.players.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  })) || [];

  const [groupName, setGroupName] = useState(group?.name || '');
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>(initialPlayers);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Player Group' : 'Create Player Group',
    });
    loadPlayers();
  }, [navigation, isEditing]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const players = await DatabaseService.getAllPlayers();
      setAllPlayers(players);
    } catch (error) {
      Alert.alert('Error', 'Failed to load players');
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayerSelection = useCallback((player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  }, []);

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    if (selectedPlayers.length === 0) {
      Alert.alert('Error', 'Select at least one player');
      return;
    }

    try {
      setSaving(true);

      if (isEditing && group) {
        await DatabaseService.updatePlayerGroup(
          group.id,
          groupName.trim(),
          selectedPlayers.map(p => p.id)
        );
      } else {
        await DatabaseService.createPlayerGroup(
          groupName.trim(),
          selectedPlayers.map(p => p.id)
        );
      }

      Alert.alert(
        'Success',
        `Player group ${isEditing ? 'updated' : 'created'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save player group');
      console.error('Failed to save group:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isEditing || !group) return;

    Alert.alert(
      'Delete Player Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deletePlayerGroup(group.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete player group');
              console.error('Failed to delete group:', error);
            }
          },
        },
      ]
    );
  };

  const renderPlayer = useCallback(({ item }: { item: Player }) => {
    const isSelected = selectedPlayers.some(p => p.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.playerCard, isSelected && styles.playerCardSelected]}
        onPress={() => togglePlayerSelection(item)}
        activeOpacity={0.7}>
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, isSelected && styles.playerNameSelected]}>
            {item.name}
          </Text>
          {item.nickname && (
            <Text style={styles.playerNickname}>"{item.nickname}"</Text>
          )}
          <Text style={styles.playerGender}>{item.gender}</Text>
        </View>
        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
          {isSelected && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  }, [selectedPlayers, styles, togglePlayerSelection]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading players...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        variant="create"
        title={isEditing ? 'Edit Group' : 'New Group'}
        subtitle={isEditing ? `Update "${group?.name}"` : 'Organize players for quick tournament setup'}
        accentColor="#8B5CF6"
        stats={[
          { label: 'players available', value: allPlayers.length, icon: 'person' },
        ]}
      />
      <ScrollView style={styles.scrollView}>
        {/* Group Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <TextInput
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            placeholderTextColor={theme.colors.text.tertiary}
            autoCapitalize="words"
          />
        </View>

        {/* Select Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Select Players ({selectedPlayers.length} selected)
          </Text>
          {allPlayers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No players available. Add some players first.
              </Text>
              <Button
                title="Manage Players"
                onPress={() => navigation.navigate('Players')}
                variant="secondary"
                size="sm"
              />
            </View>
          ) : (
            <FlatList
              data={allPlayers}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={saving ? 'Saving...' : isEditing ? 'Update Group' : 'Create Group'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
        />

        {isEditing && (
          <Button
            title="Delete Group"
            onPress={handleDelete}
            variant="outline"
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    sectionTitle: {
      ...theme.textStyles.overline,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.md,
    },
    input: {
      ...theme.textStyles.body,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    playerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.card,
    },
    playerCardSelected: {
      backgroundColor: `${theme.colors.primary}10`,
      borderColor: theme.colors.primary,
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    playerNameSelected: {
      color: theme.colors.primary,
    },
    playerNickname: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
      fontStyle: 'italic',
      marginBottom: 2,
    },
    playerGender: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
      textTransform: 'capitalize',
    },
    selectionIndicator: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    selectionIndicatorSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    buttonContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
    },
    deleteButton: {
      borderColor: theme.colors.semantic.error,
    },
    deleteButtonText: {
      color: theme.colors.semantic.error,
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

export default CreatePlayerGroupScreen;
