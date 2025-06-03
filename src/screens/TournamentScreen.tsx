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
      <TouchableOpacity
        style={[styles.matchCard, isComplete && styles.matchCardComplete]}
        onPress={() => {
          if (!isBye && !isComplete) {
            navigation.navigate('Match', { matchId: match.id, tournamentId });
          }
        }}
        disabled={isBye || isComplete}
        activeOpacity={0.7}>
        <View style={styles.matchHeader}>
          <Text style={styles.roundText}>
            {TournamentService.getRoundDisplayText(tournament?.matches || [], match.round)}
          </Text>
          {isComplete && <Text style={styles.completeText}>✓ Complete</Text>}
          {isBye && <Text style={styles.byeText}>BYE</Text>}
        </View>
        
        <View style={styles.teamsContainer}>
          <View style={[styles.teamRow, match.winner?.id === match.team1.id && styles.winnerRow]}>
            <Text style={[styles.teamName, match.winner?.id === match.team1.id && styles.winnerText]}>
              {match.team1.teamName}
            </Text>
            <Text style={[styles.score, match.winner?.id === match.team1.id && styles.winnerText]}>
              {match.score1}
            </Text>
          </View>
          
          {match.team2 && (
            <View style={[styles.teamRow, match.winner?.id === match.team2.id && styles.winnerRow]}>
              <Text style={[styles.teamName, match.winner?.id === match.team2.id && styles.winnerText]}>
                {match.team2.teamName}
              </Text>
              <Text style={[styles.score, match.winner?.id === match.team2.id && styles.winnerText]}>
                {match.score2}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
        <View style={styles.loadingContainer}>
          <Text>Loading tournament...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tournament not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.tournamentName}>{tournament.name}</Text>
              <Text style={styles.statusText}>
                Status: {tournament.status} • Round {tournament.currentRound}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={deleteTournament}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {isComplete && winner && (
          <View style={styles.winnerContainer}>
            <Text style={styles.winnerTitle}>🏆 Champion</Text>
            <Text style={styles.winnerName}>{winner.teamName}</Text>
          </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  winnerContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    alignItems: 'center',
  },
  winnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  winnerName: {
    fontSize: 16,
    color: '#856404',
  },
  bracketContainer: {
    flex: 1,
    padding: 16,
  },
  roundSection: {
    marginBottom: 24,
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  matchCardComplete: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roundText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  completeText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
  },
  byeText: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: 'bold',
  },
  teamsContainer: {
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  winnerRow: {
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  teamName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  winnerText: {
    fontWeight: 'bold',
    color: '#155724',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TournamentScreen; 