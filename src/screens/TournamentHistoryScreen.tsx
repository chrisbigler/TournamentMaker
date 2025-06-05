import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
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
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      setFilteredTournaments(sortedTournaments);
    } catch (error) {
      console.error('Error loading tournament history:', error);
      Alert.alert('Error', 'Failed to load tournament history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter tournaments based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTournaments(tournaments);
    } else {
      const filtered = tournaments.filter(tournament =>
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTournaments(filtered);
    }
  }, [searchQuery, tournaments]);

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
        return theme.colors.accent.infoBlue;
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
              setSearchQuery(''); // Clear search query
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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.pureWhite, borderColor: theme.colors.light.border }]}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={theme.colors.text.mediumGray} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.richBlack }]}
          placeholder="Search tournaments..."
          placeholderTextColor={theme.colors.text.mediumGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <MaterialIcons 
              name="clear" 
              size={20} 
              color={theme.colors.text.mediumGray}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: theme.colors.accent.errorRed }]}
        onPress={clearAllTournaments}
        activeOpacity={0.8}
      >
        <MaterialIcons name="delete" size={20} color={theme.colors.background.pureWhite} />
      </TouchableOpacity>
    </View>
  );

  const renderTournamentItem = ({ item }: { item: Tournament }) => {
    return (
      <TouchableOpacity
        onPress={() => handleTournamentPress(item)}
        activeOpacity={0.7}>
        <Card 
          variant="outlined" 
          style={styles.tournamentItem}
        >
          {/* Header Section */}
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
          
          {/* Date Section */}
          <View style={styles.dateSection}>
            <Text style={[styles.dateText, { color: theme.colors.text.mediumGray }]}>{formatDate(item.createdAt)}</Text>
          </View>
          
          {/* Tournament Info Section */}
          <View style={styles.tournamentInfo}>
            {item.winner && (
              <View style={styles.winnerRow}>
                <MaterialIcons name="emoji-events" size={16} color={theme.colors.accent.warningOrange} />
                <Text style={[styles.winnerText, { color: theme.colors.accent.warningOrange }]}>Winner: {item.winner.teamName}</Text>
              </View>
            )}
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialIcons name="groups" size={16} color={theme.colors.text.lightGray} />
                <Text style={[styles.statText, { color: theme.colors.text.lightGray }]}>Teams: {item.teams.length}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="timer" size={16} color={theme.colors.text.lightGray} />
                <Text style={[styles.statText, { color: theme.colors.text.lightGray }]}>Round: {item.currentRound}</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="history" size={64} color={theme.colors.accent.infoBlue} style={styles.emptyIcon} />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.text.richBlack }]}>
        {searchQuery ? 'No tournaments found' : 'No Tournament History'}
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.text.darkGray }]}>
        {searchQuery 
          ? `No tournaments match "${searchQuery}"`
          : 'Create your first tournament to see it appear here!'
        }
      </Text>
      {!searchQuery && (
        <Button
          title="Create Tournament"
          onPress={() => navigation.navigate('CreateTournament')}
          variant="primary"
          size="md"
        />
      )}
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
      {renderHeader()}
      <FlatList
        data={filteredTournaments}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredTournaments.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    paddingTop: 8,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  tournamentItem: {
    marginBottom: 16,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 24,
    marginRight: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateSection: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tournamentInfo: {
    gap: 8,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
    lineHeight: 20,
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
});

export default TournamentHistoryScreen; 