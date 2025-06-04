import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Tournament, TournamentStatus } from '../types';
import DatabaseService from '../services/DatabaseService';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Button, Card } from '../components';

type TournamentHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'TournamentHistory'>;

interface Props {
  navigation: TournamentHistoryNavigationProp;
}

const TournamentHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const loadTournamentHistory = useCallback(async () => {
    try {
      setLoading(true);
      const allTournaments = await DatabaseService.getAllTournaments();
      // Sort by creation date, newest first
      const sortedTournaments = allTournaments.sort(
        (a: Tournament, b: Tournament) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTournaments(sortedTournaments);
    } catch (error) {
      console.error('Error loading tournament history:', error);
      Alert.alert('Error', 'Failed to load tournament history');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTournamentHistory();
    }, [loadTournamentHistory])
  );

  const getStatusColor = (status: TournamentStatus): string => {
    switch (status) {
      case TournamentStatus.COMPLETED:
        return theme.colors.accent.successGreen;
      case TournamentStatus.ACTIVE:
        return theme.colors.primary.electricBlue;
      case TournamentStatus.SETUP:
        return theme.colors.accent.warningOrange;
      default:
        return theme.colors.text.darkGray;
    }
  };

  const getStatusText = (status: TournamentStatus): string => {
    switch (status) {
      case TournamentStatus.COMPLETED:
        return 'Completed';
      case TournamentStatus.ACTIVE:
        return 'Active';
      case TournamentStatus.SETUP:
        return 'Setup';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: TournamentStatus): keyof typeof MaterialIcons.glyphMap => {
    switch (status) {
      case TournamentStatus.COMPLETED:
        return 'check-circle';
      case TournamentStatus.ACTIVE:
        return 'play-circle-filled';
      case TournamentStatus.SETUP:
        return 'build-circle';
      default:
        return 'help-outline';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleTournamentPress = (tournament: Tournament) => {
    navigation.navigate('Tournament', { tournamentId: tournament.id });
  };

  const clearAllTournaments = async () => {
    Alert.alert(
      'Clear All Tournament History',
      'This will permanently delete ALL tournaments and their data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await DatabaseService.clearAllTournaments();
              await loadTournamentHistory(); // Refresh the list
              Alert.alert('Success', 'All tournament history has been cleared.');
            } catch (error) {
              console.error('Error clearing tournaments:', error);
              Alert.alert('Error', 'Failed to clear tournament history');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderTournamentItem = ({ item }: { item: Tournament }) => {
    const cardStyle = {
      ...styles.tournamentItem,
      borderLeftWidth: 4,
      borderLeftColor: getStatusColor(item.status),
    };
    
    return (
      <TouchableOpacity
        onPress={() => handleTournamentPress(item)}
        activeOpacity={0.7}>
        <Card 
          variant="outlined" 
          style={cardStyle}
        >
          <View style={styles.tournamentHeader}>
            <Text style={[styles.tournamentName, { color: theme.colors.text.richBlack }]}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <MaterialIcons 
                name={getStatusIcon(item.status)} 
                size={16} 
                color={getStatusColor(item.status)} 
                style={styles.statusIcon}
              />
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={[styles.statusText, { color: theme.colors.background.pureWhite }]}>{getStatusText(item.status)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.tournamentDetails}>
            <View style={styles.detailItem}>
              <MaterialIcons name="groups" size={16} color={theme.colors.accent.infoBlue} />
              <Text style={[styles.detailText, { color: theme.colors.accent.infoBlue }]}>Teams: {item.teams.length}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="timer" size={16} color={theme.colors.accent.infoBlue} />
              <Text style={[styles.detailText, { color: theme.colors.accent.infoBlue }]}>Round: {item.currentRound}</Text>
            </View>
            {item.winner && (
              <View style={styles.detailItem}>
                <MaterialIcons name="emoji-events" size={16} color={theme.colors.accent.successGreen} />
                <Text style={[styles.winnerText, { color: theme.colors.accent.successGreen }]}>Winner: {item.winner.teamName}</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.dateText, { color: theme.colors.text.mediumGray }]}>{formatDate(item.createdAt)}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="history" size={64} color={theme.colors.accent.infoBlue} style={styles.emptyIcon} />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.text.richBlack }]}>No Tournament History</Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.text.darkGray }]}>
        Create your first tournament to see it appear here!
      </Text>
      <Button
        title="Create Tournament"
        onPress={() => navigation.navigate('CreateTournament')}
        variant="primary"
        size="md"
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.coolGray }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.darkGray }]}>Loading tournament history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.coolGray }]}>
      <FlatList
        data={tournaments}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tournaments.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Dev Button - Floating trash button */}
      <TouchableOpacity
        style={[styles.devButton, { backgroundColor: theme.colors.accent.errorRed }]}
        onPress={clearAllTournaments}
        activeOpacity={0.8}>
        <MaterialIcons name="delete" size={24} color={theme.colors.background.pureWhite} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  tournamentItem: {
    marginBottom: 12,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tournamentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  devButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default TournamentHistoryScreen; 