import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Tournament, Match, Team } from '../types';
import DatabaseService from '../services/DatabaseService';
import TournamentService from '../services/TournamentService';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { Card, Button } from '../components';

type TournamentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tournament'>;
type TournamentScreenRouteProp = RouteProp<RootStackParamList, 'Tournament'>;

interface Props {
  navigation: TournamentScreenNavigationProp;
  route: TournamentScreenRouteProp;
}

const TournamentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      console.log('Loading tournament with ID:', tournamentId);
      const tournamentData = await DatabaseService.getTournament(tournamentId);
      console.log('Loaded tournament data:', JSON.stringify(tournamentData, null, 2));
      if (tournamentData) {
        console.log('Tournament matches count:', tournamentData.matches?.length || 0);
        console.log('Tournament teams count:', tournamentData.teams?.length || 0);
        console.log('Tournament matches details:', tournamentData.matches);
        
        // Auto-activate tournament if it's still in setup
        if (tournamentData.status === 'setup') {
          console.log('Tournament is in setup, activating...');
          await TournamentService.activateTournament(tournamentId);
          // Reload tournament data to get updated status
          const updatedTournamentData = await DatabaseService.getTournament(tournamentId);
          console.log('Updated tournament data after activation:', JSON.stringify(updatedTournamentData, null, 2));
          setTournament(updatedTournamentData);
        } else {
          setTournament(tournamentData);
        }

        // Fix tournaments that have teams but no matches (common issue with existing tournaments)
        if (tournamentData.teams.length >= 2 && tournamentData.matches.length === 0) {
          console.log('Tournament has teams but no matches - attempting to fix...');
          try {
            await TournamentService.fixTournamentBracket(tournamentId);
            // Reload tournament data to get the newly created matches
            const fixedTournamentData = await DatabaseService.getTournament(tournamentId);
            console.log('Tournament data after bracket fix:', JSON.stringify(fixedTournamentData, null, 2));
            setTournament(fixedTournamentData);
          } catch (error) {
            console.error('Failed to fix tournament bracket:', error);
          }
        }
      } else {
        console.log('No tournament data found!');
        setTournament(tournamentData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tournament');
      console.error('Failed to load tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = () => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteTournament(tournamentId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete tournament');
              console.error('Failed to delete tournament:', error);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadTournament();
    }, [tournamentId])
  );

  useEffect(() => {
    if (tournament) {
      navigation.setOptions({
        title: tournament.name,
      });
    }
  }, [navigation, tournament]);

  const renderMatch = ({ item: match }: { item: Match }) => {
    const isComplete = match.isComplete;
    const isBye = !match.team2;
    
    return (
      <Card 
        variant="outlined" 
        padding="lg"
        style={[
          styles.matchCard,
          isComplete && styles.matchCardComplete,
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (!isBye && !isComplete) {
              navigation.navigate('Match', { matchId: match.id, tournamentId });
            }
          }}
          disabled={isBye || isComplete}
          activeOpacity={0.7}
        >
          <View style={styles.matchHeader}>
            <Text style={styles.roundText}>
              {TournamentService.getRoundDisplayText(tournament?.matches || [], match.round)}
            </Text>
            {isComplete && <Text style={styles.completeText}>✓ Complete</Text>}
            {isBye && <Text style={styles.byeText}>BYE</Text>}
          </View>
          
          <View style={styles.teamsContainer}>
            <View style={[
              styles.teamRow,
              match.winner?.id === match.team1.id && styles.winnerRow,
            ]}>
              <Text style={[
                styles.teamName,
                match.winner?.id === match.team1.id && styles.winnerText,
              ]}>
                {match.team1.teamName}
              </Text>
              <Text style={[
                styles.score,
                match.winner?.id === match.team1.id && styles.winnerText,
              ]}>
                {match.score1}
              </Text>
            </View>
            
            {match.team2 && (
              <View style={[
                styles.teamRow,
                match.winner?.id === match.team2.id && styles.winnerRow,
              ]}>
                <Text style={[
                  styles.teamName,
                  match.winner?.id === match.team2.id && styles.winnerText,
                ]}>
                  {match.team2.teamName}
                </Text>
                <Text style={[
                  styles.score,
                  match.winner?.id === match.team2.id && styles.winnerText,
                ]}>
                  {match.score2}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderRoundSection = (round: number, matches: Match[]) => (
    <View key={round} style={styles.roundSection}>
      <Text style={styles.roundTitle}>
        {TournamentService.getRoundDisplayText(tournament?.matches || [], round)}
      </Text>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading tournament...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Tournament not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="md"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const bracketStructure = TournamentService.getBracketStructure(tournament.matches);
  console.log('Bracket structure:', bracketStructure);
  const rounds = Object.keys(bracketStructure).map(Number).sort((a, b) => a - b);
  console.log('Rounds to display:', rounds);
  console.log('Number of rounds:', rounds.length);
  console.log('Tournament matches passed to getBracketStructure:', tournament.matches?.length || 0);
  const isComplete = TournamentService.isTournamentComplete(tournament.matches);
  const winner = TournamentService.getTournamentWinner(tournament.matches);
  const runnerUp = TournamentService.getTournamentRunnerUp(tournament.matches);
  const firstPrize = tournament.pot * 0.7;
  const secondPrize = tournament.pot * 0.3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Card variant="outlined" padding="lg" style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.tournamentName}>{tournament.name}</Text>
              <Text style={styles.statusText}>
                Status: {tournament.status} • Round {tournament.currentRound}
              </Text>
            </View>
            
            <Button
              title="Delete"
              onPress={deleteTournament}
              variant="outline"
              size="sm"
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            />
          </View>
        </Card>
        
        {isComplete && winner && (
          <Card variant="outlined" padding="lg" style={styles.winnerContainer}>
            <Text style={styles.winnerTitle}>🏆 Champion</Text>
            <Text style={styles.winnerName}>{winner.teamName}</Text>
            {tournament.pot > 0 && (
              <Text style={styles.payoutText}>Wins ${firstPrize.toFixed(2)}</Text>
            )}
          </Card>
        )}
        {isComplete && runnerUp && tournament.pot > 0 && (
          <Card variant="outlined" padding="lg" style={styles.winnerContainer}>
            <Text style={styles.winnerTitle}>🥈 Runner Up</Text>
            <Text style={styles.winnerName}>{runnerUp.teamName}</Text>
            <Text style={styles.payoutText}>Wins ${secondPrize.toFixed(2)}</Text>
          </Card>
        )}
      </View>

      <ScrollView style={styles.bracketContainer}>
        {rounds.map(round => 
          renderRoundSection(round, bracketStructure[round])
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap on a match to enter scores
        </Text>
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
    header: {
      backgroundColor: theme.colors.background.coolGray,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    headerCard: {
      backgroundColor: theme.colors.background.pureWhite,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
      marginRight: theme.spacing.lg,
    },
    tournamentName: {
      ...theme.textStyles.h3,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.xs,
    },
    statusText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.darkGray,
    },
    deleteButton: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.accent.errorRed,
    },
    deleteButtonText: {
      color: theme.colors.accent.errorRed,
    },
    winnerContainer: {
      backgroundColor: theme.colors.background.pureWhite,
      borderColor: theme.colors.accent.warningOrange,
      alignItems: 'center',
    },
    winnerTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.accent.warningOrange,
      marginBottom: theme.spacing.xs,
    },
    winnerName: {
      ...theme.textStyles.bodyLarge,
      color: theme.colors.accent.warningOrange,
      fontWeight: theme.typography.fontWeights.semibold,
    },
    payoutText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.darkGray,
      marginTop: theme.spacing.xs,
    },
    bracketContainer: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    roundSection: {
      marginBottom: theme.spacing['3xl'],
    },
    roundTitle: {
      ...theme.textStyles.h3,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    matchCard: {
      marginBottom: theme.spacing.md,
    },
    matchCardComplete: {
      backgroundColor: theme.colors.background.pureWhite,
      borderColor: theme.colors.accent.successGreen,
      borderWidth: 2,
    },
    matchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    roundText: {
      ...theme.textStyles.label,
      color: theme.colors.text.darkGray,
    },
    completeText: {
      ...theme.textStyles.caption,
      color: theme.colors.accent.successGreen,
      fontWeight: theme.typography.fontWeights.bold,
      textTransform: 'uppercase',
    },
    byeText: {
      ...theme.textStyles.caption,
      color: theme.colors.accent.warningOrange,
      fontWeight: theme.typography.fontWeights.bold,
      textTransform: 'uppercase',
    },
    teamsContainer: {
      gap: theme.spacing.sm,
    },
    teamRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background.coolGray,
    },
    winnerRow: {
      backgroundColor: theme.colors.accent.successGreen,
    },
    teamName: {
      ...theme.textStyles.body,
      color: theme.colors.text.richBlack,
      flex: 1,
    },
    winnerText: {
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.white,
    },
    score: {
      ...theme.textStyles.h4,
      color: theme.colors.text.richBlack,
      minWidth: 30,
      textAlign: 'center',
      fontWeight: theme.typography.fontWeights.bold,
    },
    footer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      backgroundColor: theme.colors.background.pureWhite,
      borderTopWidth: 1,
      borderTopColor: theme.colors.light.border,
    },
    footerText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.darkGray,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      ...theme.textStyles.body,
      color: theme.colors.text.darkGray,
    },
    errorText: {
      ...theme.textStyles.h4,
      color: theme.colors.text.darkGray,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
    backButton: {
      marginTop: theme.spacing.lg,
    },
  });

export default TournamentScreen; 