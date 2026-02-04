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
import type { Theme } from '../theme';
import { Button, Card } from '../components';
import { formatCurrency } from '../utils';

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
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const loadTournamentHistory = useCallback(async () => {
    try {
      setLoading(true);
      const allTournaments = await DatabaseService.getAllTournaments();
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
        return theme.colors.primary;
      case TournamentStatus.ACTIVE:
        return theme.colors.semantic.info;
      case TournamentStatus.SETUP:
        return theme.colors.semantic.warning;
      default:
        return theme.colors.text.secondary;
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

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleTournamentPress = useCallback((tournament: Tournament) => {
    navigation.navigate('Tournament', { tournamentId: tournament.id });
  }, [navigation]);

  const clearAllTournaments = async () => {
    Alert.alert(
      'Clear All Tournament History',
      'This will permanently delete ALL tournaments and their data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await DatabaseService.clearAllTournaments();
              await loadTournamentHistory();
              setSearchQuery('');
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
      <View style={styles.searchContainer}>
        <MaterialIcons 
          name="search" 
          size={18} 
          color={theme.colors.text.tertiary} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tournaments..."
          placeholderTextColor={theme.colors.text.tertiary}
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
              size={18} 
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={clearAllTournaments}
        activeOpacity={0.8}
      >
        <MaterialIcons name="delete-outline" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderTournamentItem = useCallback(({ item }: { item: Tournament }) => {
    return (
      <TouchableOpacity
        style={styles.tournamentCard}
        onPress={() => handleTournamentPress(item)}
        activeOpacity={0.7}>
        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        
        {item.winner && (
          <View style={styles.winnerRow}>
            <MaterialIcons name="emoji-events" size={14} color={theme.colors.semantic.warning} />
            <Text style={styles.winnerText}>{item.winner.teamName}</Text>
          </View>
        )}
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statText}>{item.teams.length} teams</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statText}>Round {item.currentRound}</Text>
          </View>
          {item.buyIn > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statText}>{formatCurrency(item.buyIn)}</Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [theme, handleTournamentPress, styles]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="history" size={48} color={theme.colors.text.tertiary} style={styles.emptyIcon} />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No tournaments found' : 'No Tournament History'}
      </Text>
      <Text style={styles.emptyStateText}>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tournament history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

const createStyles = (theme: Theme) => {
  const inputLineHeight = theme.textStyles.body.lineHeight;
  const inputVerticalPadding = Math.round((40 - inputLineHeight) / 2);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    headerContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      height: 40,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...theme.textStyles.body,
      height: '100%',
      paddingVertical: inputVerticalPadding,
      lineHeight: inputLineHeight,
      color: theme.colors.text.primary,
    },
    clearButton: {
      padding: 4,
    },
    deleteButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.semantic.error,
      alignItems: 'center',
      justifyContent: 'center',
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
    listContainer: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    tournamentCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.low,
    },
    tournamentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    tournamentName: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    statusText: {
      ...theme.textStyles.caption,
      fontWeight: theme.typography.fontWeights.medium,
    },
    dateText: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.sm,
    },
    winnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      gap: 4,
    },
    winnerText: {
      ...theme.textStyles.bodySmall,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.semantic.warning,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {},
    statDivider: {
      width: 1,
      height: 12,
      backgroundColor: theme.colors.border.subtle,
      marginHorizontal: theme.spacing.sm,
    },
    statText: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyStateTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    emptyStateText: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
  });
};

export default TournamentHistoryScreen;
