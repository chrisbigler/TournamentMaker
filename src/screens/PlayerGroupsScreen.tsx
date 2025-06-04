import React, { useState, useEffect, useCallback } from 'react';
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
import { RootStackParamList, PlayerGroup, SerializedPlayerGroup } from '../types';
import DatabaseService from '../services/DatabaseService';
import { useTheme } from '../theme';
import { Button, Card } from '../components';

type PlayerGroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlayerGroups'>;

interface Props {
  navigation: PlayerGroupsScreenNavigationProp;
}

const PlayerGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const loadGroups = async () => {
    try {
      setLoading(true);
      const playerGroups = await DatabaseService.getAllPlayerGroups();
      setGroups(playerGroups);
    } catch (error) {
      Alert.alert('Error', 'Failed to load player groups');
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const renderGroup = ({ item }: { item: PlayerGroup }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CreatePlayerGroup', { 
        group: {
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          players: item.players.map(player => ({
            ...player,
            createdAt: player.createdAt.toISOString(),
            updatedAt: player.updatedAt.toISOString(),
          }))
        } as SerializedPlayerGroup
      })}
      activeOpacity={0.7}>
      <Card variant="outlined" style={styles.groupCard}>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: theme.colors.text.richBlack }]}>{item.name}</Text>
          <Text style={[styles.playerCount, { color: theme.colors.text.darkGray }]}>
            {item.players.length} players
          </Text>
          <Text style={[styles.createdDate, { color: theme.colors.text.mediumGray }]}>
            Created {item.createdAt.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.groupActions}>
          <Text style={[styles.editText, { color: theme.colors.primary.electricBlue }]}>Edit</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateTitle, { color: theme.colors.text.richBlack }]}>No Player Groups</Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.text.darkGray }]}>
        Create player groups to quickly set up tournaments with the same people
      </Text>
      <Button
        title="Create First Group"
        onPress={() => navigation.navigate('CreatePlayerGroup', {})}
        variant="primary"
        size="md"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.coolGray }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background.pureWhite, borderBottomColor: theme.colors.light.border }]}>
        <Text style={[styles.title, { color: theme.colors.text.richBlack }]}>Player Groups ({groups.length})</Text>
        <Button
          title="+ New Group"
          onPress={() => navigation.navigate('CreatePlayerGroup', {})}
          variant="secondary"
          size="sm"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.darkGray }]}>Loading groups...</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerCount: {
    fontSize: 14,
    marginBottom: 2,
  },
  createdDate: {
    fontSize: 12,
  },
  groupActions: {
    alignItems: 'flex-end',
  },
  editText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});

export default PlayerGroupsScreen; 