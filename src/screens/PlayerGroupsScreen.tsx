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

type PlayerGroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlayerGroups'>;

interface Props {
  navigation: PlayerGroupsScreenNavigationProp;
}

const PlayerGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [loading, setLoading] = useState(true);

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
      style={styles.groupCard}
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
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.playerCount}>
          {item.players.length} players
        </Text>
        <Text style={styles.createdDate}>
          Created {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.groupActions}>
        <Text style={styles.editText}>Edit</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Player Groups</Text>
      <Text style={styles.emptyStateText}>
        Create player groups to quickly set up tournaments with the same people
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreatePlayerGroup', {})}>
        <Text style={styles.addButtonText}>Create First Group</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Player Groups ({groups.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreatePlayerGroup', {})}>
          <Text style={styles.addButtonText}>+ New Group</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading groups...</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  playerCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  groupActions: {
    alignItems: 'flex-end',
  },
  editText: {
    fontSize: 14,
    color: '#2196F3',
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
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerGroupsScreen; 