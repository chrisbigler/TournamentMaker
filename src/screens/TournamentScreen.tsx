import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { formatCurrency } from '../utils';
import { MaterialIcons } from '@expo/vector-icons';

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
      const tournamentData = await DatabaseService.getTournament(tournamentId);
      if (tournamentData) {
        // Auto-activate tournament if it's still in setup
        if (tournamentData.status === 'setup') {
          await TournamentService.activateTournament(tournamentId);
          // Reload tournament data to get updated status
          const updatedTournamentData = await DatabaseService.getTournament(tournamentId);
          setTournament(updatedTournamentData);
        } else {
          setTournament(tournamentData);
        }

        // Fix tournaments that have teams but no matches (common issue with existing tournaments)
        if (tournamentData.teams.length >= 2 && tournamentData.matches.length === 0) {
          try {
            await TournamentService.fixTournamentBracket(tournamentId);
            // Reload tournament data to get the newly created matches
            const fixedTournamentData = await DatabaseService.getTournament(tournamentId);
            setTournament(fixedTournamentData);
          } catch (error) {
            console.error('Failed to fix tournament bracket:', error);
          }
        }
      } else {
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

  const renderMatch = useCallback(({ item: match }: { item: Match }) => {
    const isComplete = match.isComplete;
    const isBye = !match.team2;
    
    return (
      <TouchableOpacity
        style={[
          styles.matchCard,
          isComplete && styles.matchCardComplete,
        ]}
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
          {isComplete && (
            <View style={styles.statusBadge}>
              <MaterialIcons name="check" size={12} color={theme.colors.primary} />
              <Text style={styles.statusText}>Complete</Text>
            </View>
          )}
          {isBye && (
            <View style={[styles.statusBadge, styles.byeBadge]}>
              <Text style={styles.byeText}>BYE</Text>
            </View>
          )}
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
              match.winner?.id === match.team1.id && styles.winnerScore,
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
                match.winner?.id === match.team2.id && styles.winnerScore,
              ]}>
                {match.score2}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [navigation, tournamentId, tournament?.matches, styles, theme]);

  const renderRoundSection = useCallback((round: number, matches: Match[]) => (
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
  ), [renderMatch, tournament?.matches, styles]);

  // These hooks must be called unconditionally (before any early returns)
  const bracketStructure = useMemo(
    () => tournament ? TournamentService.getBracketStructure(tournament.matches) : {},
    [tournament]
  );
  const rounds = useMemo(
    () => Object.keys(bracketStructure).map(Number).sort((a, b) => a - b),
    [bracketStructure]
  );
  const isComplete = useMemo(
    () => tournament ? TournamentService.isTournamentComplete(tournament.matches) : false,
    [tournament]
  );
  const winner = useMemo(
    () => tournament ? TournamentService.getTournamentWinner(tournament.matches) : null,
    [tournament]
  );
  const runnerUp = useMemo(
    () => tournament ? TournamentService.getTournamentRunnerUp(tournament.matches) : null,
    [tournament]
  );
  const firstPrize = useMemo(() => tournament ? tournament.pot * 0.7 : 0, [tournament]);
  const secondPrize = useMemo(() => tournament ? tournament.pot * 0.3 : 0, [tournament]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.tournamentName}>{tournament.name}</Text>
              <Text style={styles.statusText}>
                {tournament.status === 'completed' ? 'Completed' : `Round ${tournament.currentRound}`}
              </Text>
              {tournament.buyIn > 0 && (
                <Text style={styles.buyInText}>
                  Buy-in: {formatCurrency(tournament.buyIn)} · Pot: {formatCurrency(tournament.pot)}
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              onPress={deleteTournament}
              style={styles.deleteButton}
            >
              <MaterialIcons name="delete-outline" size={20} color={theme.colors.semantic.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Winner Banner */}
        {isComplete && winner && (
          <View style={styles.winnerBanner}>
            <View style={styles.winnerContent}>
              <Text style={styles.winnerLabel}>Champion</Text>
              <Text style={styles.winnerName}>{winner.teamName}</Text>
              {tournament.pot > 0 && (
                <Text style={styles.prizeText}>Wins {formatCurrency(firstPrize)}</Text>
              )}
            </View>
          </View>
        )}
        
        {isComplete && runnerUp && tournament.pot > 0 && (
          <View style={styles.runnerUpBanner}>
            <View style={styles.winnerContent}>
              <Text style={styles.runnerUpLabel}>Runner Up</Text>
              <Text style={styles.runnerUpName}>{runnerUp.teamName}</Text>
              <Text style={styles.prizeText}>Wins {formatCurrency(secondPrize)}</Text>
            </View>
          </View>
        )}

        {/* Bracket */}
        <View style={styles.bracketContainer}>
          {rounds.map(round => 
            renderRoundSection(round, bracketStructure[round])
          )}
        </View>
      </ScrollView>

      {/* Footer hint */}
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
      backgroundColor: theme.colors.background.primary,
    },
    scrollContainer: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flex: 1,
      marginRight: theme.spacing.lg,
    },
    tournamentName: {
      ...theme.textStyles.h3,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    statusText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.secondary,
    },
    buyInText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.tertiary,
      marginTop: 4,
    },
    deleteButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background.secondary,
    },
    winnerBanner: {
      margin: theme.spacing.lg,
      padding: theme.spacing.lg,
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
    },
    winnerContent: {
      alignItems: 'center',
    },
    winnerLabel: {
      ...theme.textStyles.overline,
      color: theme.colors.primary,
      marginBottom: 4,
    },
    winnerName: {
      ...theme.textStyles.h3,
      color: theme.colors.primary,
    },
    prizeText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.secondary,
      marginTop: 4,
    },
    runnerUpBanner: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    runnerUpLabel: {
      ...theme.textStyles.overline,
      color: theme.colors.text.tertiary,
      marginBottom: 4,
    },
    runnerUpName: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
    },
    bracketContainer: {
      padding: theme.spacing.lg,
    },
    roundSection: {
      marginBottom: theme.spacing['2xl'],
    },
    roundTitle: {
      ...theme.textStyles.overline,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    matchCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.low,
    },
    matchCardComplete: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    matchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    roundText: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: theme.borderRadius.full,
    },
    statusText: {
      ...theme.textStyles.caption,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    byeBadge: {
      backgroundColor: theme.colors.background.tertiary,
    },
    byeText: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    teamsContainer: {
      gap: theme.spacing.xs,
    },
    teamRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background.secondary,
    },
    winnerRow: {
      backgroundColor: `${theme.colors.primary}15`,
    },
    teamName: {
      ...theme.textStyles.body,
      color: theme.colors.text.primary,
      flex: 1,
    },
    winnerText: {
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.primary,
    },
    score: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.secondary,
      minWidth: 28,
      textAlign: 'center',
    },
    winnerScore: {
      color: theme.colors.primary,
    },
    footer: {
      padding: theme.spacing.md,
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
    },
    footerText: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
    },
    errorText: {
      ...theme.textStyles.h4,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
    backButton: {
      marginTop: theme.spacing.lg,
    },
  });

export default TournamentScreen;
