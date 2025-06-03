import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TournamentStatus } from '../types';
import DatabaseService from '../services/DatabaseService';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import MenuItem from '../components/MenuItem';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeMain'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    // Initialize database when app starts
    initializeDatabase();
  }, []);

  const [stats, setStats] = useState({ players: 0, groups: 0, active: 0 });

  const loadStats = useCallback(async () => {
    try {
      const players = await DatabaseService.getAllPlayers();
      const groups = await DatabaseService.getAllPlayerGroups();
      const tournaments = await DatabaseService.getAllTournaments();
      const active = tournaments.filter(t => t.status === TournamentStatus.ACTIVE).length;
      setStats({ players: players.length, groups: groups.length, active });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const initializeDatabase = async () => {
    try {
      await DatabaseService.initDatabase();
    } catch (error) {
      Alert.alert('Database Error', 'Failed to initialize database');
      console.error('Database initialization error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Hero Header with Gradient */}
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#334155']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <MaterialIcons 
                name="emoji-events" 
                size={64} 
                color={theme.colors.text.white} 
              />
            </View>
            <Text style={styles.title}>Tournament Maker</Text>
            <Text style={styles.subtitle}>
              Create and manage camping group tournaments with ease
            </Text>
          </View>
          
          {/* Quick Create Tournament Button */}
          <TouchableOpacity
            style={styles.quickCreateButton}
            onPress={() => navigation.navigate('CreateTournament')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create new tournament">
            <MaterialIcons 
              name="add" 
              size={24} 
              color={theme.colors.text.white} 
            />
            <Text style={styles.quickCreateText}>Create Tournament</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.players}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.groups}</Text>
              <Text style={styles.statLabel}>Groups</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <MenuItem
            title="Manage Players"
            subtitle="Add and edit players"
            icon="people"
            variant="neutral"
            onPress={() => navigation.navigate('Players')}
          />
          <MenuItem
            title="Player Groups"
            subtitle="Saved groups"
            icon="group-work"
            variant="neutral"
            onPress={() => navigation.navigate('PlayerGroups')}
          />
          <MenuItem
            title="Tournament History"
            subtitle="Past tournaments"
            icon="history"
            variant="neutral"
            onPress={() => navigation.navigate('TournamentHistory')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.coolGray,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Increased padding for bottom navigation clearance
  },
  heroSection: {
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.elevated,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.textStyles.h1,
    color: theme.colors.text.white,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontSize: 32,
  },
  subtitle: {
    ...theme.textStyles.bodyLarge,
    color: theme.colors.text.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  quickCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.accentGreen,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  quickCreateText: {
    ...theme.textStyles.buttonLarge,
    color: theme.colors.text.white,
    fontWeight: 'bold',
  },
  sectionTitle: {
    ...theme.textStyles.h3,
    color: theme.colors.text.darkGray,
    marginBottom: theme.spacing.xl,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...theme.textStyles.h2,
    color: theme.colors.text.darkGray,
  },
  statLabel: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.mediumGray,
    marginTop: theme.spacing.xs,
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
});

export default HomeScreen; 