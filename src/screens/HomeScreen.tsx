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

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeMain'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeMessage}>
            Ready to organize your next tournament? Use the navigation below to manage players, create groups, or view your tournament history.
          </Text>
        </View>
        
        {/* Getting Started Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          
          <View style={styles.tipCard}>
            <MaterialIcons 
              name="lightbulb" 
              size={40} 
              color={theme.colors.accent.warningOrange} 
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Pro Tip</Text>
              <Text style={styles.tipDescription}>
                Set up your players and groups first, then creating tournaments becomes quick and easy!
              </Text>
            </View>
          </View>

          {/* Create Tournament Button */}
          <TouchableOpacity
            style={styles.createTournamentButton}
            onPress={() => navigation.navigate('CreateTournament')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create new tournament">
            <MaterialIcons 
              name="add" 
              size={24} 
              color={theme.colors.text.white} 
            />
            <Text style={styles.createTournamentText}>Create Tournament</Text>
          </TouchableOpacity>
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

      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.coolGray,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  welcomeSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
    backgroundColor: theme.colors.background.pureWhite,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
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
  tipsSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
    backgroundColor: theme.colors.background.pureWhite,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.card,
  },
  sectionTitle: {
    ...theme.textStyles.h3,
    color: theme.colors.text.darkGray,
    marginBottom: theme.spacing.xl,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: theme.colors.background.coolGray,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  tipContent: {
    alignItems: 'center',
  },
  tipTitle: {
    ...theme.textStyles.h4,
    color: theme.colors.text.darkGray,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  tipDescription: {
    ...theme.textStyles.body,
    color: theme.colors.text.mediumGray,
    lineHeight: 20,
    textAlign: 'center',
  },
  createTournamentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.action.secondary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
    width: '100%',
  },
  createTournamentText: {
    ...theme.textStyles.buttonLarge,
    color: theme.colors.text.white,
    fontWeight: 'bold',
  },
  featuresSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
    backgroundColor: theme.colors.background.pureWhite,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.card,
  },
  featureGrid: {
    gap: theme.spacing.lg,
  },
  featureCard: {
    backgroundColor: theme.colors.background.coolGray,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
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
  });

export default HomeScreen; 