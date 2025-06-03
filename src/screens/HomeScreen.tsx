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
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import DatabaseService from '../services/DatabaseService';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeMain'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    // Initialize database when app starts
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

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeMessage}>
            Ready to organize your next tournament? Use the navigation below to manage players, create groups, or view your tournament history.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Perfect For</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <MaterialIcons 
                name="nature" 
                size={40} 
                color={theme.colors.accent.successGreen} 
              />
              <Text style={styles.featureTitle}>Outdoor Events</Text>
              <Text style={styles.featureDescription}>
                Offline support for when you're ready to disconnect.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialIcons 
                name="groups" 
                size={40} 
                color={theme.colors.accent.infoBlue} 
              />
              <Text style={styles.featureTitle}>Group Activities</Text>
              <Text style={styles.featureDescription}>
                Manage multiple teams and players effortlessly
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialIcons 
                name="scoreboard" 
                size={40} 
                color={theme.colors.accent.warningOrange} 
              />
              <Text style={styles.featureTitle}>Score Tracking</Text>
              <Text style={styles.featureDescription}>
                Real-time scoring with tournament progression
              </Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <MaterialIcons 
                name="lightbulb" 
                size={24} 
                color={theme.colors.primary.electricBlue} 
              />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Pro Tip</Text>
              <Text style={styles.tipDescription}>
                Set up your players and groups first, then creating tournaments becomes quick and easy!
              </Text>
            </View>
          </View>
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
    backgroundColor: theme.colors.primary.electricBlue,
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
  welcomeSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
    backgroundColor: theme.colors.background.pureWhite,
    marginHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.card,
  },
  welcomeTitle: {
    ...theme.textStyles.h2,
    color: theme.colors.text.darkGray,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  welcomeMessage: {
    ...theme.textStyles.body,
    color: theme.colors.text.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.textStyles.h3,
    color: theme.colors.text.darkGray,
    marginBottom: theme.spacing.xl,
    fontWeight: '600',
  },
  featureGrid: {
    gap: theme.spacing.lg,
  },
  featureCard: {
    backgroundColor: theme.colors.background.pureWhite,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  featureTitle: {
    ...theme.textStyles.h4,
    color: theme.colors.text.darkGray,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  featureDescription: {
    ...theme.textStyles.body,
    color: theme.colors.text.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
    paddingTop: theme.spacing.lg,
  },
  tipCard: {
    backgroundColor: theme.colors.background.pureWhite,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  tipIconContainer: {
    backgroundColor: theme.colors.background.coolGray,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...theme.textStyles.h4,
    color: theme.colors.text.darkGray,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  tipDescription: {
    ...theme.textStyles.body,
    color: theme.colors.text.mediumGray,
    lineHeight: 20,
  },
});

export default HomeScreen; 