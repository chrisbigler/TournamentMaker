import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import { RootStackParamList, Player, Gender, PlayerGroup } from '../types';
import DatabaseService from '../services/DatabaseService';
import TournamentService, { TeamCreationMode } from '../services/TournamentService';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { Button, Card, ScreenHeader } from '../components';
import { formatCurrencyInput, parseCurrency } from '../utils';
import { MaterialIcons } from '@expo/vector-icons';

type CreateTournamentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateTournament'>;

interface Props {
  navigation: CreateTournamentScreenNavigationProp;
}

const CreateTournamentScreen: React.FC<Props> = ({ navigation }) => {
  const [tournamentName, setTournamentName] = useState('');
  const [buyIn, setBuyIn] = useState('');
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
      // Reset flags when screen comes into focus
      setTournamentCreated(false);
      setIsDiscarding(false);
    }, [loadPlayers, loadPlayerGroups])
  );

  // Track if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return tournamentName.trim().length > 0 || 
           buyIn.length > 0 || 
           selectedPlayers.length > 0;
  }, [tournamentName, buyIn, selectedPlayers]);

  // Track if we successfully created a tournament (to skip reset on navigation to Tournament)
  const [tournamentCreated, setTournamentCreated] = useState(false);
  
  // Track if user confirmed discard (to prevent beforeRemove loop)
  const [isDiscarding, setIsDiscarding] = useState(false);

  // Go back to Home - uses popToTop for correct "back" animation
  const goBackToHome = useCallback(() => {
    // Only pop if there's somewhere to go back to
    if (navigation.canGoBack()) {
      navigation.dispatch(StackActions.popToTop());
    }
  }, [navigation]);

  // Handle back button press - show confirmation if there are unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If tournament was created or user confirmed discard, allow navigation
      if (tournamentCreated || isDiscarding || !hasUnsavedChanges) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show confirmation alert
      Alert.alert(
        'Discard Tournament?',
        'You have unsaved changes. Are you sure you want to leave? Your progress will be lost.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              // Set flag to bypass beforeRemove on the next navigation
              setIsDiscarding(true);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, tournamentCreated, isDiscarding]);
  
  // When isDiscarding becomes true, go back to home
  useEffect(() => {
    if (isDiscarding) {
      goBackToHome();
    }
  }, [isDiscarding, goBackToHome]);

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
        teamMode,
        parseCurrency(buyIn)
      );

      // Mark as created so blur listener doesn't reset the stack
      setTournamentCreated(true);
      
      Alert.alert(
        'Success',
        'Tournament created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Replace CreateTournament with Tournament screen
              // This keeps HomeMain in the stack, so back from Tournament goes to Home
              navigation.dispatch(
                StackActions.replace('Tournament', { tournamentId })
              );
            },
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
      <ScreenHeader
        variant="create"
        title="New Tournament"
        subtitle="Set up your bracket and start competing"
        accentColor={theme.colors.primary}
        stats={[
          { label: 'players available', value: allPlayers.length, icon: 'person' },
          { label: 'groups ready', value: playerGroups.length, icon: 'group-work' },
        ]}
      />
      <ScrollView style={styles.scrollView}>
        {/* Tournament Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournament Name</Text>
          <TextInput
            style={styles.input}
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Enter tournament name"
            placeholderTextColor={theme.colors.text.tertiary}
            autoCapitalize="words"
          />
        </View>

        {/* Buy In */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy In Amount</Text>
          <View style={styles.currencyInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.currencyInput}
              value={buyIn}
              onChangeText={(text) => setBuyIn(formatCurrencyInput(text))}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Team Mode */}
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
                <Text style={[
                  styles.modeTitle,
                  teamMode === option.mode && styles.modeTitleSelected,
                ]}>
                  {option.title}
                </Text>
                <Text style={styles.modeDescription}>{option.description}</Text>
              </View>
              <View style={[
                styles.radioButton,
                teamMode === option.mode && styles.radioButtonSelectedContainer,
              ]}>
                {teamMode === option.mode && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Player Groups */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Player Groups</Text>
            {selectedGroup && (
              <TouchableOpacity onPress={clearGroupSelection}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
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
                    <Text style={styles.groupPlayerCount}>
                      {item.players.length} players
                    </Text>
                  </View>
                  <View style={[styles.selectionIndicator, selectedGroup?.id === item.id && styles.selectionIndicatorSelected]}>
                    {selectedGroup?.id === item.id && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
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
          title={creating ? 'Creating...' : 'Create Tournament'}
          onPress={createTournament}
          loading={creating}
          disabled={creating}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => {
  const inputLineHeight = theme.textStyles.body.lineHeight;
  const inputVerticalPadding = Math.max(
    0,
    Math.round((48 - inputLineHeight) / 2) - (Platform.OS === 'ios' ? 2 : 0)
  );

  return StyleSheet.create({
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
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    clearText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    input: {
      ...theme.textStyles.body,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: inputVerticalPadding,
      height: 48,
      lineHeight: inputLineHeight,
      textAlignVertical: 'center',
    },
    currencyInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      height: 48,
    },
    currencySymbol: {
      ...theme.textStyles.body,
      color: theme.colors.text.tertiary,
    },
    currencyInput: {
      flex: 1,
      ...theme.textStyles.body,
      color: theme.colors.text.primary,
      paddingLeft: theme.spacing.xs,
      paddingVertical: inputVerticalPadding,
      height: '100%',
      lineHeight: inputLineHeight,
      textAlignVertical: 'center',
    },
    modeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.card,
    },
    modeOptionSelected: {
      backgroundColor: `${theme.colors.primary}10`,
      borderColor: theme.colors.primary,
    },
    modeInfo: {
      flex: 1,
    },
    modeTitle: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    modeTitleSelected: {
      color: theme.colors.primary,
    },
    modeDescription: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelectedContainer: {
      borderColor: theme.colors.primary,
    },
    radioButtonSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
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
    groupCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.card,
    },
    groupCardSelected: {
      backgroundColor: `${theme.colors.primary}10`,
      borderColor: theme.colors.primary,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    groupNameSelected: {
      color: theme.colors.primary,
    },
    groupPlayerCount: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
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
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
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
};

export default CreateTournamentScreen;
