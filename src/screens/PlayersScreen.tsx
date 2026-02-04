import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Player } from '../types';
import DatabaseService from '../services/DatabaseService';
import TournamentService from '../services/TournamentService';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import ProfilePicture from '../components/ProfilePicture';
import ScreenHeader from '../components/ScreenHeader';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type PlayersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Players'>;

interface Props {
  navigation: PlayersScreenNavigationProp;
}

const PlayersScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixingStats, setFixingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const allPlayers = await DatabaseService.getAllPlayers();
      const sortedPlayers = sortPlayersByWinPercentage(allPlayers);
      setPlayers(sortedPlayers);
      setFilteredPlayers(sortedPlayers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load players');
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.nickname && player.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

  const sortPlayersByWinPercentage = (playerList: Player[]) => {
    return [...playerList].sort((a, b) => {
      const aGamesPlayed = a.wins + a.losses;
      const bGamesPlayed = b.wins + b.losses;
      
      if (aGamesPlayed === 0 && bGamesPlayed === 0) return 0;
      if (aGamesPlayed === 0) return 1;
      if (bGamesPlayed === 0) return -1;
      
      const aWinRate = a.wins / aGamesPlayed;
      const bWinRate = b.wins / bGamesPlayed;
      
      if (aWinRate !== bWinRate) {
        return bWinRate - aWinRate;
      }
      
      if (a.wins !== b.wins) {
        return b.wins - a.wins;
      }
      
      return a.losses - b.losses;
    });
  };

  const getBadgeForPlayer = useCallback((player: Player, index: number) => {
    const playersWithGames = players.filter(p => (p.wins + p.losses) > 0);
    
    if (playersWithGames.length < 2) return null;
    
    const playerGamesPlayed = player.wins + player.losses;
    if (playerGamesPlayed === 0) return null;
    
    const bestPlayerIndex = players.findIndex(p => p.id === playersWithGames[0].id);
    const worstPlayerIndex = players.findIndex(p => p.id === playersWithGames[playersWithGames.length - 1].id);
    
    if (index === bestPlayerIndex) {
      return { text: 'Champ', color: theme.colors.primary };
    }
    
    if (index === worstPlayerIndex && playersWithGames.length > 1) {
      return { text: 'Last', color: theme.colors.semantic.error };
    }
    
    return null;
  }, [players, theme.colors.primary, theme.colors.semantic.error]);

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
              await loadPlayers();
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

  const renderGenderLabel = useCallback((gender: string) => {
    const isMale = gender.toLowerCase() === 'male';
    const iconName = isMale ? 'human-male' : 'human-female';
    const iconColor = isMale ? '#4082c9' : '#D865A3';
    
    return (
      <View style={styles.genderContainer}>
        <MaterialCommunityIcons 
          name={iconName} 
          size={12} 
          color={iconColor}
          style={styles.genderIcon}
        />
        <Text style={[styles.genderText, { color: iconColor }]}>
          {gender}
        </Text>
      </View>
    );
  }, [styles]);

  const screenWidth = useMemo(() => Dimensions.get('window').width, []);
  const isTablet = useMemo(() => screenWidth > 600, [screenWidth]);
  
  const renderPlayer = useCallback(({ item, index }: { item: Player; index: number }) => {
    const profileSize = isTablet ? 'large' : 'medium';
    const badge = getBadgeForPlayer(item, index);
    
    return (
      <TouchableOpacity
        style={styles.playerCard}
        onPress={() => navigation.navigate('CreatePlayer', { player: item })}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Edit player ${item.name}`}>
        <View style={styles.playerContent}>
          <View style={styles.playerMainInfo}>
            <ProfilePicture
              profilePicture={item.profilePicture}
              name={item.name}
              size={profileSize}
              style={styles.profilePicture}
              showBorder={false}
            />
            <View style={styles.playerInfo}>
              <View style={styles.nameContainer}>
                {badge && (
                  <View style={[styles.badge, { backgroundColor: badge.color }]}>
                    <Text style={styles.badgeText}>{badge.text}</Text>
                  </View>
                )}
                <Text style={styles.playerName}>{item.name}</Text>
              </View>
              {item.nickname && (
                <Text style={styles.playerNickname}>"{item.nickname}"</Text>
              )}
              {renderGenderLabel(item.gender)}
            </View>
          </View>
          <View style={styles.playerStats}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {item.wins}W - {item.losses}L
              </Text>
              <Text style={styles.winRate}>
                {item.wins + item.losses > 0
                  ? `${Math.round((item.wins / (item.wins + item.losses)) * 100)}%`
                  : '0%'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isTablet, getBadgeForPlayer, renderGenderLabel, navigation, styles]);

  const renderEmptyState = () => {
    if (searchQuery.trim() !== '') {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="search-off" size={48} color={theme.colors.text.tertiary} style={styles.emptyIcon} />
          <Text style={styles.emptyStateTitle}>No Players Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or add a new player
          </Text>
          <Button
            title="Add New Player"
            onPress={() => navigation.navigate('CreatePlayer', {})}
            variant="primary"
            style={styles.emptyStateButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="person-add" size={48} color={theme.colors.primary} style={styles.emptyIcon} />
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
  };

  const renderResetButton = () => (
    <TouchableOpacity
      style={styles.resetButton}
      onPress={handleFixPlayerStats}
      disabled={fixingStats}
      activeOpacity={0.7}
    >
      <MaterialIcons 
        name="sync" 
        size={18} 
        color="#FFFFFF" 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        variant="list"
        title="Players"
        count={filteredPlayers.length}
        onAdd={() => navigation.navigate('CreatePlayer', {})}
        addLabel="+ Add"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search players..."
        rightAction={renderResetButton()}
      />

      {loading || fixingStats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
          />
          <Text style={styles.loadingText}>
            {fixingStats ? 'Resetting player statistics...' : 'Loading players...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlayers}
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    resetButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContainer: {
      padding: theme.spacing.lg,
    },
    playerCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.low,
    },
    playerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    playerMainInfo: {
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
    nameContainer: {
      marginBottom: 2,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
      marginBottom: 4,
      alignSelf: 'flex-start',
    },
    badgeText: {
      ...theme.textStyles.caption,
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeights.medium,
      fontSize: 10,
    },
    playerName: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
    },
    playerNickname: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
      fontStyle: 'italic',
      marginBottom: 2,
    },
    genderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    genderIcon: {
      marginRight: 4,
    },
    genderText: {
      ...theme.textStyles.caption,
      textTransform: 'capitalize',
    },
    playerStats: {
      alignItems: 'flex-end',
      flexShrink: 0,
      marginLeft: theme.spacing.sm,
    },
    statsContainer: {
      backgroundColor: theme.colors.background.secondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      minWidth: 60,
    },
    statsText: {
      ...theme.textStyles.bodySmall,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    winRate: {
      ...theme.textStyles.caption,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['6xl'],
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
      paddingHorizontal: theme.spacing['3xl'],
    },
    emptyStateButton: {
      minWidth: 180,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
  });

export default PlayersScreen;
