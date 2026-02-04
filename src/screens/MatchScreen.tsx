import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Match, Tournament } from '../types';
import TournamentService from '../services/TournamentService';
import DatabaseService from '../services/DatabaseService';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';

type MatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Match'>;
type MatchScreenRouteProp = RouteProp<RootStackParamList, 'Match'>;

interface Props {
  navigation: MatchScreenNavigationProp;
  route: MatchScreenRouteProp;
}

const MatchScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { matchId, tournamentId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadMatchAndTournament = async () => {
      try {
        const [matchData, tournamentData] = await Promise.all([
          DatabaseService.getMatch(matchId),
          DatabaseService.getTournament(tournamentId)
        ]);
        
        if (matchData) {
          setMatch(matchData);
          setScore1(matchData.score1);
          setScore2(matchData.score2);
        } else {
          Alert.alert('Error', 'Match not found');
          navigation.goBack();
        }

        if (tournamentData) {
          setTournament(tournamentData);
        }
      } catch (error) {
        console.error('Failed to load match/tournament:', error);
        Alert.alert('Error', 'Failed to load match');
        navigation.goBack();
      }
    };

    loadMatchAndTournament();
  }, [matchId, tournamentId, navigation]);

  const updateScore = (team: 1 | 2, increment: number) => {
    if (team === 1) {
      setScore1(prev => Math.max(0, prev + increment));
    } else {
      setScore2(prev => Math.max(0, prev + increment));
    }
  };

  const handleScoreChange = (team: 1 | 2, value: string) => {
    if (value === '') {
      if (team === 1) {
        setScore1(0);
      } else {
        setScore2(0);
      }
      return;
    }

    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
      if (team === 1) {
        setScore1(numericValue);
      } else {
        setScore2(numericValue);
      }
    }
  };

  const saveMatch = async (isComplete: boolean = false) => {
    if (!match) return;

    try {
      setSaving(true);
      await TournamentService.updateMatchScore(
        matchId,
        tournamentId,
        score1,
        score2,
        isComplete
      );

      if (isComplete) {
        navigation.goBack();
      } else {
        Alert.alert('Saved', 'Match score updated');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save match');
      console.error('Failed to save match:', error);
    } finally {
      setSaving(false);
    }
  };

  const completeMatch = () => {
    if (score1 === score2) {
      Alert.alert('Error', 'Match cannot end in a tie. Please adjust the scores.');
      return;
    }

    Alert.alert(
      'Complete Match',
      `Are you sure you want to complete this match?\n\n${match?.team1.teamName}: ${score1}\n${match?.team2?.teamName || 'Opponent'}: ${score2}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => saveMatch(true),
        },
      ]
    );
  };

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading match...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth > 600;
  const isByeMatch = !match.team2;

  if (isByeMatch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            {tournament 
              ? TournamentService.getRoundDisplayText(tournament.matches, match.round)
              : `Round ${match.round}`
            }
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.byeCard}>
            <MaterialIcons 
              name="trending-up" 
              size={48} 
              color={theme.colors.primary} 
              style={styles.byeIcon}
            />
            <Text style={styles.byeTitle}>Automatic Advancement</Text>
            <Text style={styles.byeSubtitle}>
              {match.team1.teamName} advances to the next round
            </Text>
            
            <View style={styles.teamDetails}>
              <Text style={styles.teamDetailName}>{match.team1.teamName}</Text>
              <Text style={styles.playerNames}>
                {match.team1.player1.nickname || match.team1.player1.name} & {match.team1.player2.nickname || match.team1.player2.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Continue"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            {tournament 
              ? TournamentService.getRoundDisplayText(tournament.matches, match.round)
              : `Round ${match.round}`
            }
          </Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.scoreSection, isTablet && styles.scoreSectionTablet]}>
            {/* Team 1 */}
            <View style={styles.scoreCard}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{match.team1.teamName}</Text>
                <Text style={styles.playerNames}>
                  {match.team1.player1.nickname || match.team1.player1.name} & {match.team1.player2.nickname || match.team1.player2.name}
                </Text>
              </View>
              <View style={styles.scoreControls}>
                <TouchableOpacity
                  style={[styles.scoreButton, styles.decrementButton]}
                  onPress={() => updateScore(1, -1)}
                  disabled={score1 <= 0}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="remove" 
                    size={24} 
                    color={score1 <= 0 ? theme.colors.text.tertiary : '#FFFFFF'} 
                  />
                </TouchableOpacity>
                
                <View style={styles.scoreDisplay}>
                  <TextInput
                    style={styles.scoreText}
                    value={score1.toString()}
                    onChangeText={(value) => handleScoreChange(1, value)}
                    keyboardType="numeric"
                    textAlign="center"
                    selectTextOnFocus={true}
                    maxLength={3}
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.scoreButton, styles.incrementButton]}
                  onPress={() => updateScore(1, 1)}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="add" 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* VS Divider */}
            <View style={styles.vsDivider}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Team 2 */}
            <View style={styles.scoreCard}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{match.team2?.teamName}</Text>
                <Text style={styles.playerNames}>
                  {match.team2?.player1.nickname || match.team2?.player1.name} & {match.team2?.player2.nickname || match.team2?.player2.name}
                </Text>
              </View>
              <View style={styles.scoreControls}>
                <TouchableOpacity
                  style={[styles.scoreButton, styles.decrementButton]}
                  onPress={() => updateScore(2, -1)}
                  disabled={score2 <= 0}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="remove" 
                    size={24} 
                    color={score2 <= 0 ? theme.colors.text.tertiary : '#FFFFFF'} 
                  />
                </TouchableOpacity>
                
                <View style={styles.scoreDisplay}>
                  <TextInput
                    style={styles.scoreText}
                    value={score2.toString()}
                    onChangeText={(value) => handleScoreChange(2, value)}
                    keyboardType="numeric"
                    textAlign="center"
                    selectTextOnFocus={true}
                    maxLength={3}
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.scoreButton, styles.incrementButton]}
                  onPress={() => updateScore(2, 1)}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="add" 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title={saving ? 'Saving...' : 'Save Score'}
          onPress={() => saveMatch(false)}
          variant="secondary"
          size="lg"
          disabled={saving}
        />
        
        <Button
          title="Complete Match"
          onPress={completeMatch}
          variant="primary"
          size="lg"
          disabled={saving || score1 === score2}
        />
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
    scrollContainer: {
      flex: 1,
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
    header: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    headerSubtitle: {
      ...theme.textStyles.overline,
      color: theme.colors.text.tertiary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    scoreSection: {
      gap: theme.spacing.lg,
    },
    scoreSectionTablet: {
      flexDirection: 'row',
      gap: theme.spacing.xl,
    },
    scoreCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      padding: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.low,
    },
    teamInfo: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    teamName: {
      ...theme.textStyles.h4,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    playerNames: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
    scoreControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    scoreButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    incrementButton: {
      backgroundColor: theme.colors.primary,
    },
    decrementButton: {
      backgroundColor: theme.colors.semantic.error,
    },
    scoreDisplay: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    scoreText: {
      ...theme.textStyles.h1,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.bold,
      textAlign: 'center',
    },
    vsDivider: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    vsText: {
      ...theme.textStyles.overline,
      color: theme.colors.text.tertiary,
    },
    actionButtons: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
    },
    // Bye match styles
    byeCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      padding: theme.spacing['2xl'],
      alignItems: 'center',
      ...theme.shadows.low,
    },
    byeIcon: {
      marginBottom: theme.spacing.md,
    },
    byeTitle: {
      ...theme.textStyles.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    byeSubtitle: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    teamDetails: {
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.md,
      width: '100%',
    },
    teamDetailName: {
      ...theme.textStyles.h4,
      color: theme.colors.primary,
      marginBottom: 4,
    },
  });

export default MatchScreen;
