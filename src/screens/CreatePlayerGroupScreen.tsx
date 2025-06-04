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
import { theme } from '../theme';

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
        <View style={styles.selectionIndicator}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading players...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <TextInput
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Select Players ({selectedPlayers.length} selected)
          </Text>
          {allPlayers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No players available. Add some players first.
              </Text>
              <TouchableOpacity
                style={styles.addPlayersButton}
                onPress={() => navigation.navigate('Players')}>
                <Text style={styles.addPlayersButtonText}>Manage Players</Text>
              </TouchableOpacity>
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
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : isEditing ? 'Update Group' : 'Create Group'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Group</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.coolGray,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.background.pureWhite,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background.pureWhite,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.background.pureWhite,
  },
  playerCardSelected: {
    backgroundColor: theme.colors.accent.successGreen,
    borderColor: theme.colors.accent.successGreen,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 2,
  },
  playerNameSelected: {
    color: theme.colors.accent.successGreen,
  },
  playerNickname: {
    fontSize: 14,
    color: theme.colors.text.darkGray,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  playerNicknameSelected: {
    color: theme.colors.accent.successGreen,
  },
  playerGender: {
    fontSize: 12,
    color: theme.colors.text.mediumGray,
    textTransform: 'capitalize',
  },
  playerGenderSelected: {
    color: theme.colors.accent.successGreen,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 18,
    color: theme.colors.accent.successGreen,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  addPlayersButton: {
    backgroundColor: theme.colors.primary.electricBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPlayersButtonText: {
    color: theme.colors.background.pureWhite,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: theme.colors.accent.warningOrange,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.text.lightGray,
  },
  saveButtonText: {
    color: theme.colors.background.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: theme.colors.accent.errorRed,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: theme.colors.background.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePlayerGroupScreen; 