import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import DatabaseService from '../services/DatabaseService';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeMain'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  useEffect(() => {
    initializeDatabase();
  }, []);

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

        {/* Hero Section with Gradient */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[`${theme.colors.primary}15`, `${theme.colors.primary}05`, 'transparent']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <MaterialIcons name="emoji-events" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Ready to compete?</Text>
            <Text style={styles.heroSubtitle}>
              Set up your players and groups first, then creating tournaments becomes quick and easy.
            </Text>
          </View>
          
          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateTournament')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Create new tournament">
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="add" size={22} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Tournament</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('CreatePlayer', {})}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F620' }]}>
              <MaterialIcons name="person-add" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionLabel}>Add Player</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('CreatePlayerGroup', {})}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF620' }]}>
              <MaterialIcons name="group-add" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionLabel}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('TournamentHistory')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B20' }]}>
              <MaterialIcons name="history" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Built for outdoor fun</Text>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
              <MaterialIcons name="wifi-off" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Works Offline</Text>
              <Text style={styles.featureDescription}>
                No internet? No problem. Everything works locally on your device.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#3B82F615' }]}>
              <MaterialIcons name="groups" size={24} color="#3B82F6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Team Pairing</Text>
              <Text style={styles.featureDescription}>
                Auto-generate boy/girl teams or let us randomly pair everyone.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#F59E0B15' }]}>
              <MaterialIcons name="trending-up" size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Track Stats</Text>
              <Text style={styles.featureDescription}>
                Keep track of wins, losses, and bragging rights across all tournaments.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing['2xl'],
    },
    // Hero Section
    heroSection: {
      padding: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      position: 'relative',
    },
    heroGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    heroContent: {
      marginBottom: theme.spacing.xl,
    },
    heroIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    heroTitle: {
      ...theme.textStyles.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    heroSubtitle: {
      ...theme.textStyles.body,
      color: theme.colors.text.secondary,
      lineHeight: 22,
    },
    createButton: {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.medium,
    },
    createButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    createButtonText: {
      ...theme.textStyles.button,
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeights.semibold,
    },
    // Quick Actions
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      padding: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.low,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    quickActionLabel: {
      ...theme.textStyles.caption,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeights.medium,
      textAlign: 'center',
    },
    // Features Section
    featuresSection: {
      paddingHorizontal: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.textStyles.h4,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    featureCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    featureIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      ...theme.textStyles.body,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    featureDescription: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.tertiary,
      lineHeight: 18,
    },
  });

export default HomeScreen;
