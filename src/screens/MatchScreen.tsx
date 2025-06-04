import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Match, Tournament } from '../types';
import TournamentService from '../services/TournamentService';
import DatabaseService from '../services/DatabaseService';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card from '../components/Card';

type MatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Match'>;
type MatchScreenRouteProp = RouteProp<RootStackParamList, 'Match'>;

interface Props {
  navigation: MatchScreenNavigationProp;
  route: MatchScreenRouteProp;
}

const MatchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { matchId, tournamentId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadMatchAndTournament = async () => {
      try {
        console.log('Loading match with ID:', matchId);
        console.log('Loading tournament with ID:', tournamentId);
        
        // Load both match and tournament data
        const [matchData, tournamentData] = await Promise.all([
          DatabaseService.getMatch(matchId),
          DatabaseService.getTournament(tournamentId)
        ]);
        
        console.log('Loaded match data:', matchData);
        console.log('Loaded tournament data:', tournamentData);
        
        if (matchData) {
          setMatch(matchData);
          setScore1(matchData.score1);
          setScore2(matchData.score2);
        } else {
          console.error('Match not found with ID:', matchId);
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
    // Allow empty string for clearing
    if (value === '') {
      if (team === 1) {
        setScore1(0);
      } else {
        setScore2(0);
      }
      return;
    }

    // Only allow numeric input
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
        Alert.alert(
          'Match Complete',
          `${score1 > score2 ? match.team1.teamName : match.team2?.teamName} wins!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
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

  // Handle bye matches differently
  if (isByeMatch) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.subtitle}>
              {tournament 
                ? TournamentService.getRoundDisplayText(tournament.matches, match.round)
                : `Round ${match.round}`
              }
            </Text>
          </View>
        </View>

        {/* Bye Match Content */}
        <View style={styles.content}>
          <Card style={styles.byeCard}>
            <MaterialIcons 
              name="trending-up" 
              size={64} 
              color={theme.colors.accent.successGreen} 
              style={styles.byeIcon}
            />
            <Text style={styles.byeTitle}>Automatic Advancement</Text>
            <Text style={styles.byeSubtitle}>
              {match.team1.teamName} advances to the next round
            </Text>
            
            <View style={styles.teamDetails}>
              <Text style={styles.teamName}>{match.team1.teamName}</Text>
              <Text style={styles.playerNames}>
                "{match.team1.player1.nickname || match.team1.player1.name}"
              </Text>
              <Text style={styles.playerNames}>
                "{match.team1.player2.nickname || match.team1.player2.name}"
              </Text>
            </View>
          </Card>
        </View>

        {/* Action Button for Bye */}
        <View style={styles.actionButtons}>
          <Button
            title="Continue"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="lg"
            style={styles.actionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContainer}>
        {/* Header with back button */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.subtitle}>
              {tournament 
                ? TournamentService.getRoundDisplayText(tournament.matches, match.round)
                : `Round ${match.round}`
              }
            </Text>
          </View>
        </View>

        {/* Match Content */}
        <View style={styles.content}>
          {/* Score Section */}
          <View style={[styles.scoreSection, isTablet && styles.scoreSectionTablet]}>
            {/* Team 1 Score */}
            <Card style={isTablet ? { ...styles.scoreCard, ...styles.scoreCardTablet } : styles.scoreCard}>
              <View style={styles.teamInfo}>
                <Text style={isTablet ? { ...styles.teamName, ...styles.teamNameTablet } : styles.teamName}>
                  {match.team1.teamName}
                </Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerNames}>
                    "{match.team1.player1.nickname || match.team1.player1.name}" & "{match.team1.player2.nickname || match.team1.player2.name}"
                  </Text>
                </View>
              </View>
              <View style={styles.scoreControls}>
                <TouchableOpacity
                  style={isTablet ? { ...styles.scoreButton, ...styles.decrementButton, ...styles.scoreButtonTablet } : { ...styles.scoreButton, ...styles.decrementButton }}
                  onPress={() => updateScore(1, -1)}
                  disabled={score1 <= 0}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="remove" 
                    size={isTablet ? 32 : 28} 
                    color={score1 <= 0 ? theme.colors.text.mediumGray : theme.colors.text.white} 
                  />
                </TouchableOpacity>
                
                <View style={isTablet ? { ...styles.scoreDisplay, ...styles.scoreDisplayTablet } : styles.scoreDisplay}>
                  <TextInput
                    style={isTablet ? { ...styles.scoreText, ...styles.scoreTextTablet } : styles.scoreText}
                    value={score1.toString()}
                    onChangeText={(value) => handleScoreChange(1, value)}
                    keyboardType="numeric"
                    textAlign="center"
                    selectTextOnFocus={true}
                    maxLength={3}
                  />
                </View>
                
                <TouchableOpacity
                  style={isTablet ? { ...styles.scoreButton, ...styles.incrementButton, ...styles.scoreButtonTablet } : { ...styles.scoreButton, ...styles.incrementButton }}
                  onPress={() => updateScore(1, 1)}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="add" 
                    size={isTablet ? 32 : 28} 
                    color={theme.colors.text.white} 
                  />
                </TouchableOpacity>
              </View>
            </Card>

            {/* Team 2 Score - Always rendered for normal matches */}
            <Card style={isTablet ? { ...styles.scoreCard, ...styles.scoreCardTablet } : styles.scoreCard}>
              <View style={styles.teamInfo}>
                <Text style={isTablet ? { ...styles.teamName, ...styles.teamNameTablet } : styles.teamName}>
                  {match.team2?.teamName}
                </Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerNames}>
                    "{match.team2?.player1.nickname || match.team2?.player1.name}" & "{match.team2?.player2.nickname || match.team2?.player2.name}"
                  </Text>
                </View>
              </View>
              <View style={styles.scoreControls}>
                <TouchableOpacity
                  style={isTablet ? { ...styles.scoreButton, ...styles.decrementButton, ...styles.scoreButtonTablet } : { ...styles.scoreButton, ...styles.decrementButton }}
                  onPress={() => updateScore(2, -1)}
                  disabled={score2 <= 0}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="remove" 
                    size={isTablet ? 32 : 28} 
                    color={score2 <= 0 ? theme.colors.text.mediumGray : theme.colors.text.white} 
                  />
                </TouchableOpacity>
                
                <View style={isTablet ? { ...styles.scoreDisplay, ...styles.scoreDisplayTablet } : styles.scoreDisplay}>
                  <TextInput
                    style={isTablet ? { ...styles.scoreText, ...styles.scoreTextTablet } : styles.scoreText}
                    value={score2.toString()}
                    onChangeText={(value) => handleScoreChange(2, value)}
                    keyboardType="numeric"
                    textAlign="center"
                    selectTextOnFocus={true}
                    maxLength={3}
                  />
                </View>
                
                <TouchableOpacity
                  style={isTablet ? { ...styles.scoreButton, ...styles.incrementButton, ...styles.scoreButtonTablet } : { ...styles.scoreButton, ...styles.incrementButton }}
                  onPress={() => updateScore(2, 1)}
                  activeOpacity={0.7}>
                  <MaterialIcons 
                    name="add" 
                    size={isTablet ? 32 : 28} 
                    color={theme.colors.text.white} 
                  />
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title={saving ? 'Saving...' : 'Save Score'}
          onPress={() => saveMatch(false)}
          variant="secondary"
          size="lg"
          disabled={saving}
          style={styles.actionButton}
        />
        
        <Button
          title="Complete Match"
          onPress={completeMatch}
          variant="primary"
          size="lg"
          disabled={saving || score1 === score2}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.coolGray,
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
    ...theme.textStyles.bodyLarge,
    color: theme.colors.text.mediumGray,
  },
  header: {
    backgroundColor: theme.colors.primary.deepNavy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.card,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchTitle: {
    ...theme.textStyles.h2,
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.textStyles.body,
    color: theme.colors.text.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  scoreSection: {
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  scoreSectionTablet: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  scoreCard: {
    padding: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCardTablet: {
    flex: 1,
    padding: theme.spacing['4xl'],
  },
  teamInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  teamName: {
    ...theme.textStyles.h4,
    color: theme.colors.text.richBlack,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  teamNameTablet: {
    ...theme.textStyles.h3,
    marginBottom: theme.spacing.md,
  },
  playerInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  playerNames: {
    ...theme.textStyles.body,
    color: theme.colors.text.darkGray,
    textAlign: 'center',
    lineHeight: theme.textStyles.body.fontSize * 1.3,
    fontWeight: '500',
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    width: '100%',
  },
  scoreButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
    elevation: 4,
  },
  scoreButtonTablet: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  incrementButton: {
    backgroundColor: theme.colors.accent.successGreen,
  },
  decrementButton: {
    backgroundColor: theme.colors.accent.errorRed,
  },
  scoreDisplay: {
    backgroundColor: theme.colors.background.lightGray,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minWidth: 100,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary.electricBlue,
    elevation: 2,
  },
  scoreDisplayTablet: {
    minWidth: 120,
    minHeight: 100,
    paddingHorizontal: theme.spacing['3xl'],
    paddingVertical: theme.spacing.xl,
  },
  scoreText: {
    ...theme.textStyles.h1,
    color: theme.colors.primary.electricBlue,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: theme.textStyles.h1.fontSize * 1.1,
  },
  scoreTextTablet: {
    fontSize: 64,
    lineHeight: 72,
  },
  actionButtons: {
    padding: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.pureWhite,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
    alignItems: 'stretch',
  },
  actionButton: {
    minHeight: theme.dimensions.buttonHeight.lg,
    alignSelf: 'stretch',
  },
  // Bye match specific styles
  byeCard: {
    padding: theme.spacing['4xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
  },
  byeIcon: {
    marginBottom: theme.spacing.lg,
  },
  byeTitle: {
    ...theme.textStyles.h2,
    color: theme.colors.text.richBlack,
    textAlign: 'center',
    fontWeight: '600',
  },
  byeSubtitle: {
    ...theme.textStyles.bodyLarge,
    color: theme.colors.text.darkGray,
    textAlign: 'center',
    lineHeight: theme.textStyles.bodyLarge.fontSize * 1.4,
  },
  teamDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.lightGray,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    gap: theme.spacing.sm,
  },
  scoreLabel: {
    ...theme.textStyles.h4,
    color: theme.colors.text.richBlack,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scoreLabelTablet: {
    ...theme.textStyles.h3,
    marginBottom: theme.spacing.xl,
  },
});

export default MatchScreen; 