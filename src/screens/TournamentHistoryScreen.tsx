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

type TournamentHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'TournamentHistory'>;

interface Props {
  navigation: TournamentHistoryNavigationProp;
}

const TournamentHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

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
        return '#4CAF50';
      case TournamentStatus.ACTIVE:
        return '#2196F3';
      case TournamentStatus.SETUP:
        return '#FF9800';
      default:
        return '#757575';
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

  const renderTournamentItem = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      style={styles.tournamentItem}
      onPress={() => handleTournamentPress(item)}
      activeOpacity={0.7}>
      <View style={styles.tournamentHeader}>
        <Text style={styles.tournamentName}>{item.name}</Text>
        <View style={styles.statusContainer}>
          <MaterialIcons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status)} 
            style={styles.statusIcon}
          />
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tournamentDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="groups" size={16} color="#666" />
          <Text style={styles.detailText}>Teams: {item.teams.length}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="timer" size={16} color="#666" />
          <Text style={styles.detailText}>Round: {item.currentRound}</Text>
        </View>
        {item.winner && (
          <View style={styles.detailItem}>
            <MaterialIcons name="emoji-events" size={16} color="#4CAF50" />
            <Text style={styles.winnerText}>Winner: {item.winner.teamName}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="history" size={64} color="#ccc" style={styles.emptyIcon} />
      <Text style={styles.emptyStateTitle}>No Tournament History</Text>
      <Text style={styles.emptyStateText}>
        Create your first tournament to see it appear here!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateTournament')}>
        <MaterialIcons name="add" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.createButtonText}>Create Tournament</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tournament history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        style={styles.devButton}
        onPress={clearAllTournaments}
        activeOpacity={0.8}>
        <MaterialIcons name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#fff',
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
    color: '#666',
    marginLeft: 4,
  },
  winnerText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
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
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#f44336',
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