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
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Player, Gender, PlayerGroup } from '../types';
import DatabaseService from '../services/DatabaseService';
import TournamentService, { TeamCreationMode } from '../services/TournamentService';
import { theme } from '../theme';

type CreateTournamentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateTournament'>;

interface Props {
  navigation: CreateTournamentScreenNavigationProp;
}

const CreateTournamentScreen: React.FC<Props> = ({ navigation }) => {
  const [tournamentName, setTournamentName] = useState('');
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teamMode, setTeamMode] = useState<TeamCreationMode>(TeamCreationMode.MANUAL);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [playerGroups, setPlayerGroups] = useState<PlayerGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PlayerGroup | null>(null);

  const loadPlayers = useCallback(async () => {
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
  }, []);

  const loadPlayerGroups = useCallback(async () => {
    try {
      const groups = await DatabaseService.getAllPlayerGroups();
      setPlayerGroups(groups);
    } catch (error) {
      console.error('Failed to load player groups:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
      loadPlayerGroups();
    }, [loadPlayers, loadPlayerGroups])
  );

  const selectPlayerGroup = (group: PlayerGroup) => {
    setSelectedGroup(group);
    setSelectedPlayers(group.players);
  };

  const clearGroupSelection = () => {
    setSelectedGroup(null);
    setSelectedPlayers([]);
  };

  const togglePlayerSelection = (player: Player) => {
    if (selectedGroup) {
      setSelectedGroup(null);
    }
    
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const validateTournament = (): string | null => {
    if (!tournamentName.trim()) {
      return 'Tournament name is required';
    }

    if (selectedPlayers.length < 2) {
      return 'Select at least 2 players';
    }

    if (teamMode === TeamCreationMode.BOY_GIRL) {
      const males = selectedPlayers.filter(p => p.gender === Gender.MALE);
      const females = selectedPlayers.filter(p => p.gender === Gender.FEMALE);
      
      if (males.length === 0 || females.length === 0) {
        return 'Boy/Girl mode requires at least one male and one female player';
      }
    }

    return null;
  };

  const createTournament = async () => {
    const validationError = validateTournament();
    if (validationError) {
      Alert.alert('Error', validationError);
      return;
    }

    try {
      setCreating(true);
      const tournamentId = await TournamentService.createTournament(
        tournamentName.trim(),
        selectedPlayers,
        teamMode
      );

      Alert.alert(
        'Success',
        'Tournament created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Tournament', { tournamentId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create tournament');
      console.error('Failed to create tournament:', error);
    } finally {
      setCreating(false);
    }
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

  const teamModeOptions = [
    {
      mode: TeamCreationMode.MANUAL,
      title: 'Random Teams',
      description: 'Players will be randomly paired into teams',
    },
    {
      mode: TeamCreationMode.BOY_GIRL,
      title: 'Boy/Girl Teams',
      description: 'Each team will have one male and one female player',
    },
  ];

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
          <Text style={styles.sectionTitle}>Tournament Name</Text>
          <TextInput
            style={styles.input}
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Enter tournament name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Creation Mode</Text>
          {teamModeOptions.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.modeOption,
                teamMode === option.mode && styles.modeOptionSelected,
              ]}
              onPress={() => setTeamMode(option.mode)}>
              <View style={styles.modeInfo}>
                <Text
                  style={[
                    styles.modeTitle,
                    teamMode === option.mode && styles.modeTitleSelected,
                  ]}>
                  {option.title}
                </Text>
                <Text
                  style={[
                    styles.modeDescription,
                    teamMode === option.mode && styles.modeDescriptionSelected,
                  ]}>
                  {option.description}
                </Text>
              </View>
              <View style={styles.radioButton}>
                {teamMode === option.mode && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitleInContainer}>Player Groups (Optional)</Text>
            {selectedGroup && (
              <TouchableOpacity
                style={styles.clearGroupButton}
                onPress={clearGroupSelection}>
                <Text style={styles.clearGroupButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {playerGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No player groups available. Create groups to quickly select multiple players.
              </Text>
              <TouchableOpacity
                style={styles.addPlayersButton}
                onPress={() => navigation.navigate('PlayerGroups')}>
                <Text style={styles.addPlayersButtonText}>Manage Groups</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={playerGroups}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.groupCard,
                    selectedGroup?.id === item.id && styles.groupCardSelected,
                  ]}
                  onPress={() => selectPlayerGroup(item)}
                  activeOpacity={0.7}>
                  <View style={styles.groupInfo}>
                    <Text style={[
                      styles.groupName,
                      selectedGroup?.id === item.id && styles.groupNameSelected,
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.groupPlayerCount,
                      selectedGroup?.id === item.id && styles.groupPlayerCountSelected,
                    ]}>
                      {item.players.length} players
                    </Text>
                  </View>
                  <View style={styles.selectionIndicator}>
                    {selectedGroup?.id === item.id && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
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
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={createTournament}
          disabled={creating}>
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : 'Create Tournament'}
          </Text>
        </TouchableOpacity>
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
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.background.pureWhite,
  },
  modeOptionSelected: {
    backgroundColor: theme.colors.background.coolGray,
    borderColor: theme.colors.primary.electricBlue,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 4,
  },
  modeTitleSelected: {
    color: theme.colors.primary.electricBlue,
  },
  modeDescription: {
    fontSize: 14,
    color: theme.colors.text.darkGray,
  },
  modeDescriptionSelected: {
    color: theme.colors.primary.deepNavy,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary.electricBlue,
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
  },
  createButton: {
    backgroundColor: theme.colors.accent.successGreen,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: theme.colors.text.lightGray,
  },
  createButtonText: {
    color: theme.colors.background.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleInContainer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.background.pureWhite,
  },
  groupCardSelected: {
    backgroundColor: theme.colors.accent.successGreen,
    borderColor: theme.colors.accent.successGreen,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 2,
  },
  groupNameSelected: {
    color: theme.colors.accent.successGreen,
  },
  groupPlayerCount: {
    fontSize: 14,
    color: theme.colors.text.darkGray,
  },
  groupPlayerCountSelected: {
    color: theme.colors.accent.successGreen,
  },
  clearGroupButton: {
    backgroundColor: theme.colors.primary.electricBlue,
    padding: 8,
    borderRadius: 8,
  },
  clearGroupButtonText: {
    color: theme.colors.background.pureWhite,
    fontWeight: 'bold',
  },
});

export default CreateTournamentScreen; 