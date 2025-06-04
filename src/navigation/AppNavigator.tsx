import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import { useTheme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import ThemeToggle from '../components/ThemeToggle';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import PlayersScreen from '../screens/PlayersScreen';
import CreatePlayerScreen from '../screens/CreatePlayerScreen';
import CreateTournamentScreen from '../screens/CreateTournamentScreen';
import TournamentScreen from '../screens/TournamentScreen';
import MatchScreen from '../screens/MatchScreen';
import PlayerGroupsScreen from '../screens/PlayerGroupsScreen';
import CreatePlayerGroupScreen from '../screens/CreatePlayerGroupScreen';
import TournamentHistoryScreen from '../screens/TournamentHistoryScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Create stack navigators for each tab
const HomeStack = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary.deepNavy,
          ...theme.shadows.card,
        },
        headerTintColor: theme.colors.text.white,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: theme.colors.text.white,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background.coolGray,
        },
        headerRight: () => <ThemeToggle />, 
      }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTournament"
        component={CreateTournamentScreen}
        options={{ title: 'Create Tournament' }}
      />
      <Stack.Screen
        name="Tournament"
        component={TournamentScreen}
        options={{ title: 'Tournament' }}
      />
      <Stack.Screen
        name="Match"
        component={MatchScreen}
        options={{ title: 'Match' }}
      />
    </Stack.Navigator>
  );
};

const PlayersStack = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary.deepNavy,
          ...theme.shadows.card,
        },
        headerTintColor: theme.colors.text.white,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: theme.colors.text.white,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background.coolGray,
        },
        headerRight: () => <ThemeToggle />,
      }}>
      <Stack.Screen
        name="PlayersMain"
        component={PlayersScreen}
        options={{ title: 'Players' }}
      />
    <Stack.Screen 
      name="CreatePlayer" 
      component={CreatePlayerScreen} 
      options={{ title: 'Add Player' }}
      />
    </Stack.Navigator>
  );
};

const PlayerGroupsStack = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary.deepNavy,
          ...theme.shadows.card,
        },
        headerTintColor: theme.colors.text.white,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: theme.colors.text.white,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background.coolGray,
        },
        headerRight: () => <ThemeToggle />,
      }}>
      <Stack.Screen
        name="PlayerGroupsMain"
        component={PlayerGroupsScreen}
        options={{ title: 'Player Groups' }}
      />
    <Stack.Screen 
      name="CreatePlayerGroup" 
      component={CreatePlayerGroupScreen} 
      options={{ title: 'Create Group' }}
      />
    </Stack.Navigator>
  );
};

const HistoryStack = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary.deepNavy,
          ...theme.shadows.card,
        },
        headerTintColor: theme.colors.text.white,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: theme.colors.text.white,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background.coolGray,
        },
        headerRight: () => <ThemeToggle />,
      }}>
      <Stack.Screen
        name="TournamentHistoryMain"
        component={TournamentHistoryScreen}
        options={{ title: 'Tournament History' }}
      />
    </Stack.Navigator>
  );
};

const BottomTabNavigator = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.pureWhite,
          borderTopColor: theme.colors.light.border,
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 8,
          height: 88,
          ...theme.shadows.card,
        },
        tabBarActiveTintColor: theme.colors.primary.electricBlue,
        tabBarInactiveTintColor: theme.colors.text.mediumGray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Players"
      component={PlayersStack}
      options={{
        tabBarLabel: 'Players',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="people" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="PlayerGroups"
      component={PlayerGroupsStack}
      options={{
        tabBarLabel: 'Groups',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="group-work" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="TournamentHistory"
      component={HistoryStack}
      options={{
        tabBarLabel: 'History',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="history" size={size} color={color} />
        ),
      }}
    />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;