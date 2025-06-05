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
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { Button, Card } from '../components';

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

  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

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
        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
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
          <Text style={styles.loadingText}>Loading players...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text style={styles.sectionTitle}>Tournament Name</Text>
          <TextInput
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Enter tournament name"
            autoCapitalize="words"
          />
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
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
              <View style={[
                styles.radioButton,
                teamMode === option.mode && styles.radioButtonSelectedContainer,
              ]}>
                {teamMode === option.mode && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <Card variant="outlined" padding="lg" style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitleInContainer}>Player Groups (Optional)</Text>
            {selectedGroup && (
              <Button
                title="Clear"
                onPress={clearGroupSelection}
                variant="ghost"
                size="sm"
              />
            )}
          </View>
          {playerGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No player groups available. Create groups to quickly select multiple players.
              </Text>
              <Button
                title="Manage Groups"
                onPress={() => navigation.navigate('PlayerGroups')}
                variant="secondary"
                size="sm"
              />
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
                  <View style={[styles.selectionIndicator, selectedGroup?.id === item.id && styles.selectionIndicatorSelected]}>
                    {selectedGroup?.id === item.id && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
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
          title={creating ? 'Creating...' : 'Create Tournament'}
          onPress={createTournament}
          loading={creating}
          disabled={creating}
        />
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
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.lg,
    },
    modeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.light.border,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background.pureWhite,
    },
    modeOptionSelected: {
      backgroundColor: `${theme.colors.primary.electricBlue}15`, // 15% opacity
      borderColor: theme.colors.primary.electricBlue,
      borderWidth: 2,
      shadowColor: theme.colors.primary.electricBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    modeInfo: {
      flex: 1,
    },
    modeTitle: {
      ...theme.textStyles.label,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.xs,
    },
    modeTitleSelected: {
      color: theme.colors.text.richBlack,
      fontWeight: '600',
    },
    modeDescription: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.darkGray,
      lineHeight: 18,
    },
    modeDescriptionSelected: {
      color: theme.colors.text.darkGray,
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.light.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    radioButtonSelectedContainer: {
      borderColor: theme.colors.primary.electricBlue,
    },
    radioButtonSelected: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary.electricBlue,
    },
    playerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.light.border,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
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
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
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
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    sectionTitleInContainer: {
      ...theme.textStyles.h4,
      color: theme.colors.text.richBlack,
    },
    groupCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.light.border,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background.pureWhite,
    },
    groupCardSelected: {
      backgroundColor: `${theme.colors.accent.successGreen}15`, // 15% opacity
      borderColor: theme.colors.accent.successGreen,
      borderWidth: 2,
      shadowColor: theme.colors.accent.successGreen,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...theme.textStyles.label,
      color: theme.colors.text.richBlack,
      marginBottom: 2,
    },
    groupNameSelected: {
      color: theme.colors.text.richBlack,
      fontWeight: '600',
    },
    groupPlayerCount: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.darkGray,
    },
    groupPlayerCountSelected: {
      color: theme.colors.text.darkGray,
      fontWeight: '500',
    },
  });

export default CreateTournamentScreen; 