import React, { useState, useEffect } from 'react';
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
import { Button, Card, TextInput as CustomTextInput } from '../components';

type CreatePlayerGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreatePlayerGroup'>;
type CreatePlayerGroupScreenRouteProp = RouteProp<RootStackParamList, 'CreatePlayerGroup'>;

interface Props {
  navigation: CreatePlayerGroupScreenNavigationProp;
  route: CreatePlayerGroupScreenRouteProp;
}

const CreatePlayerGroupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { group } = route.params || {};
  const isEditing = !!group;

  // Convert serialized players back to Player objects
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

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

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
        // Update existing group
        await DatabaseService.updatePlayerGroup(
          group.id,
          groupName.trim(),
          selectedPlayers.map(p => p.id)
        );
      } else {
        // Create new group
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

  const renderPlayer = ({ item }: { item: Player }) => {
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
            <Text style={[styles.playerNickname, isSelected && styles.playerNicknameSelected]}>
              "{item.nickname}"
            </Text>
          )}
          <Text style={[styles.playerGender, isSelected && styles.playerGenderSelected]}>
            {item.gender}
          </Text>
        </View>
        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

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
      <ScrollView style={styles.scrollView}>
        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <CustomTextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            autoCapitalize="words"
          />
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
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
        </Card>
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
      backgroundColor: theme.colors.background.coolGray,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      margin: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.md,
    },
    playerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.light.border,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background.pureWhite,
    },
    playerCardSelected: {
      backgroundColor: `${theme.colors.accent.successGreen}15`, // 15% opacity
      borderColor: theme.colors.accent.successGreen,
      borderWidth: 2,
      shadowColor: theme.colors.accent.successGreen,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      ...theme.textStyles.label,
      color: theme.colors.text.richBlack,
      marginBottom: 2,
    },
    playerNameSelected: {
      color: theme.colors.text.richBlack,
      fontWeight: '600',
    },
    playerNickname: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.darkGray,
      fontStyle: 'italic',
      marginBottom: 2,
    },
    playerNicknameSelected: {
      color: theme.colors.text.darkGray,
      fontWeight: '500',
    },
    playerGender: {
      ...theme.textStyles.caption,
      color: theme.colors.text.mediumGray,
      textTransform: 'capitalize',
    },
    playerGenderSelected: {
      color: theme.colors.text.mediumGray,
      fontWeight: '500',
    },
    selectionIndicator: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.light.border,
    },
    selectionIndicatorSelected: {
      backgroundColor: theme.colors.accent.successGreen,
      borderColor: theme.colors.accent.successGreen,
    },
    checkmark: {
      ...theme.textStyles.body,
      color: theme.colors.background.pureWhite,
      fontWeight: 'bold',
      fontSize: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
      ...theme.textStyles.body,
      color: theme.colors.text.darkGray,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    buttonContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    deleteButton: {
      borderColor: theme.colors.accent.errorRed,
    },
    deleteButtonText: {
      color: theme.colors.accent.errorRed,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.textStyles.body,
      color: theme.colors.text.darkGray,
    },
  });

export default CreatePlayerGroupScreen; 