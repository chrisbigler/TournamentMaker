import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Player } from '../types';
import DatabaseService from '../services/DatabaseService';
import TournamentService from '../services/TournamentService';
import { theme } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import ProfilePicture from '../components/ProfilePicture';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type PlayersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Players'>;

interface Props {
  navigation: PlayersScreenNavigationProp;
}

const PlayersScreen: React.FC<Props> = ({ navigation }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixingStats, setFixingStats] = useState(false);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const allPlayers = await DatabaseService.getAllPlayers();
      // Sort players by win percentage (descending)
      const sortedPlayers = sortPlayersByWinPercentage(allPlayers);
      setPlayers(sortedPlayers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load players');
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortPlayersByWinPercentage = (playerList: Player[]) => {
    return [...playerList].sort((a, b) => {
      const aGamesPlayed = a.wins + a.losses;
      const bGamesPlayed = b.wins + b.losses;
      
      // Players with no games go to the end
      if (aGamesPlayed === 0 && bGamesPlayed === 0) return 0;
      if (aGamesPlayed === 0) return 1;
      if (bGamesPlayed === 0) return -1;
      
      const aWinRate = a.wins / aGamesPlayed;
      const bWinRate = b.wins / bGamesPlayed;
      
      // Sort by win rate descending
      if (aWinRate !== bWinRate) {
        return bWinRate - aWinRate;
      }
      
      // If win rates are equal, sort by number of wins descending (more wins = better)
      if (a.wins !== b.wins) {
        return b.wins - a.wins;
      }
      
      // If wins are also equal, sort by losses ascending (fewer losses = better)
      return a.losses - b.losses;
    });
  };

  const getBadgeForPlayer = (player: Player, index: number) => {
    // Only show badges if there are at least 2 players with games played
    const playersWithGames = players.filter(p => (p.wins + p.losses) > 0);
    
    if (playersWithGames.length < 2) return null;
    
    const playerGamesPlayed = player.wins + player.losses;
    if (playerGamesPlayed === 0) return null;
    
    // Find the indices of the best and worst players among those who have played games
    const bestPlayerIndex = players.findIndex(p => p.id === playersWithGames[0].id);
    const worstPlayerIndex = players.findIndex(p => p.id === playersWithGames[playersWithGames.length - 1].id);
    
    if (index === bestPlayerIndex) {
      return { text: 'The Goat 🐐', color: theme.colors.accent.successGreen, opacity: 0.3 };
    }
    
    if (index === worstPlayerIndex && playersWithGames.length > 1) {
      return { text: 'Biggest Loser 😭', color: theme.colors.accent.errorRed, opacity: 0.3 };
    }
    
    return null;
  };

  const handleFixPlayerStats = async () => {
    Alert.alert(
      'Reset Player Statistics',
      'This will reset all player win/loss records back to 0-0. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Stats',
          onPress: async () => {
            try {
              setFixingStats(true);
              await TournamentService.resetPlayerStatistics();
              await loadPlayers(); // Reload to see updated stats
              Alert.alert('Success', 'Player statistics have been reset!');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset player statistics');
              console.error('Failed to reset player statistics:', error);
            } finally {
              setFixingStats(false);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

  const renderGenderLabel = (gender: string) => {
    const isMale = gender.toLowerCase() === 'male';
    const iconName = isMale ? 'human-male' : 'human-female';
    const iconColor = isMale ? theme.colors.primary.electricBlue : '#E91E63';
    
    return (
      <View style={styles.genderContainer}>
        <MaterialCommunityIcons 
          name={iconName} 
          size={14} 
          color={iconColor}
          style={styles.genderIcon}
        />
        <Text style={[styles.genderText, { color: iconColor }]}>
          {gender}
        </Text>
      </View>
    );
  };

  const renderPlayer = ({ item, index }: { item: Player; index: number }) => {
    const screenWidth = Dimensions.get('window').width;
    const isTablet = screenWidth > 600;
    const profileSize = isTablet ? 'large' : 'medium';
    const badge = getBadgeForPlayer(item, index);
    
    return (
      <Card style={isTablet ? styles.playerCardTablet : styles.playerCard}>
        <TouchableOpacity
          style={isTablet ? styles.playerContentTablet : styles.playerContent}
          onPress={() => navigation.navigate('CreatePlayer', { player: item })}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Edit player ${item.name}`}>
          <View style={isTablet ? styles.playerMainInfoTablet : styles.playerMainInfo}>
            <ProfilePicture
              profilePicture={item.profilePicture}
              name={item.name}
              size={profileSize}
              style={styles.profilePicture}
              showBorder={false}
            />
            <View style={isTablet ? styles.playerInfoTablet : styles.playerInfo}>
              <View style={styles.nameContainer}>
                <View style={styles.nameRow}>
                  <Text style={isTablet ? styles.playerNameTablet : styles.playerName}>
                    {item.name}
                  </Text>
                  {badge && (
                    <View style={[styles.badge, { backgroundColor: badge.color }]}>
                      <Text style={styles.badgeText}>{badge.text}</Text>
                    </View>
                  )}
                </View>
              </View>
              {item.nickname && (
                <Text style={isTablet ? styles.playerNicknameTablet : styles.playerNickname}>
                  "{item.nickname}"
                </Text>
              )}
              {renderGenderLabel(item.gender)}
            </View>
          </View>
          <View style={isTablet ? styles.playerStatsTablet : styles.playerStats}>
            <View style={isTablet ? styles.statsContainerTablet : styles.statsContainer}>
              <Text style={isTablet ? styles.statsTextTablet : styles.statsText}>
                {item.wins}W - {item.losses}L
              </Text>
              <Text style={isTablet ? styles.winRateTablet : styles.winRate}>
                {item.wins + item.losses > 0
                  ? `${Math.round((item.wins / (item.wins + item.losses)) * 100)}%`
                  : '0%'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Players Yet</Text>
      <Text style={styles.emptyStateText}>
        Add your first player to get started with tournaments
      </Text>
      <Button
        title="Add First Player"
        onPress={() => navigation.navigate('CreatePlayer', {})}
        variant="primary"
        style={styles.emptyStateButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Players ({players.length})</Text>
        <View style={styles.headerButtons}>
          <Button
            title="Reset"
            onPress={handleFixPlayerStats}
            variant="outline"
            size="sm"
            style={styles.fixButton}
            disabled={fixingStats}
          />
          <Button
            title="+ Add Player"
            onPress={() => navigation.navigate('CreatePlayer', {})}
            variant="secondary"
            size="sm"
          />
        </View>
      </View>

      {loading || fixingStats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary.electricBlue} 
          />
          <Text style={styles.loadingText}>
            {fixingStats ? 'Resetting player statistics...' : 'Loading players...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.pureWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.coolGray,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
    ...theme.shadows.card,
  },
  title: {
    ...theme.textStyles.h3,
    color: theme.colors.text.richBlack,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fixButton: {
    minWidth: 80,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  playerCard: {
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  playerCardTablet: {
    marginBottom: theme.spacing.lg,
  },
  playerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  playerContentTablet: {
    padding: theme.spacing.lg,
  },
  playerMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  playerMainInfoTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  profilePicture: {
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playerInfoTablet: {
    flex: 1,
    minWidth: 0,
  },
  nameContainer: {
    marginBottom: theme.spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
    marginTop: 0,
  },
  badgeText: {
    ...theme.textStyles.caption,
    color: theme.colors.background.pureWhite,
    fontWeight: theme.textStyles.button.fontWeight,
    fontSize: 10,
  },
  playerName: {
    ...theme.textStyles.h4,
    color: theme.colors.text.richBlack,
  },
  playerNameTablet: {
    ...theme.textStyles.h4,
    color: theme.colors.text.richBlack,
  },
  playerNickname: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.darkGray,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  playerNicknameTablet: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.darkGray,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderIcon: {
    marginRight: theme.spacing.xs,
  },
  genderText: {
    ...theme.textStyles.caption,
    color: theme.colors.text.mediumGray,
    textTransform: 'capitalize',
  },
  playerStats: {
    alignItems: 'flex-end',
    flexShrink: 0,
    marginLeft: theme.spacing.sm,
  },
  playerStatsTablet: {
    alignItems: 'flex-end',
    flexShrink: 0,
    marginLeft: theme.spacing.md,
  },
  statsContainer: {
    backgroundColor: theme.colors.background.lightGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 60,
  },
  statsContainerTablet: {
    backgroundColor: theme.colors.background.lightGray,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    minWidth: 80,
  },
  statsText: {
    ...theme.textStyles.body,
    fontWeight: theme.textStyles.h4.fontWeight,
    color: theme.colors.text.richBlack,
    marginBottom: theme.spacing.xs,
  },
  statsTextTablet: {
    ...theme.textStyles.body,
    fontWeight: theme.textStyles.h4.fontWeight,
    color: theme.colors.text.richBlack,
    marginBottom: theme.spacing.xs,
  },
  winRate: {
    ...theme.textStyles.caption,
    color: theme.colors.accent.successGreen,
    fontWeight: theme.textStyles.button.fontWeight,
  },
  winRateTablet: {
    ...theme.textStyles.caption,
    color: theme.colors.accent.successGreen,
    fontWeight: theme.textStyles.button.fontWeight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['8xl'],
  },
  emptyStateTitle: {
    ...theme.textStyles.h3,
    color: theme.colors.text.richBlack,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    ...theme.textStyles.body,
    color: theme.colors.text.darkGray,
    textAlign: 'center',
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['4xl'],
  },
  emptyStateButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.textStyles.body,
    color: theme.colors.text.darkGray,
    marginTop: theme.spacing.lg,
  },
});

export default PlayersScreen; 