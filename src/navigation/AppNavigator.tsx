import React, { memo, useMemo } from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import { useTheme } from '../theme';
import { useThemeMode } from '../theme';
import type { Theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import ThemeToggle from '../components/ThemeToggle';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';

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

// Memoized ThemeToggle component for header
const MemoizedThemeToggle = memo(ThemeToggle);
const HeaderRight = memo(() => <MemoizedThemeToggle />);

// Extracted and memoized CreateTournamentButton component
interface CreateTournamentButtonProps {
  onPress: () => void;
  backgroundColor: string;
  iconColor: string;
}

const CreateTournamentButton = memo(({ onPress, backgroundColor, iconColor }: CreateTournamentButtonProps) => (
  <TouchableOpacity
    style={[createTournamentButtonStyles.button, { backgroundColor }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <MaterialIcons name="add" size={28} color={iconColor} />
  </TouchableOpacity>
));

const createTournamentButtonStyles = StyleSheet.create({
  button: {
    top: -12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});

// Custom hook for header styles - refined design
const useHeaderStyles = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  
  return useMemo(() => ({
    headerStyle: {
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
    },
    headerTintColor: theme.colors.text.primary,
    headerTitleStyle: {
      fontWeight: theme.textStyles.h4.fontWeight,
      fontSize: theme.textStyles.h4.fontSize,
      color: theme.colors.text.primary,
      letterSpacing: theme.typography.letterSpacings.tight,
    },
    cardStyle: {
      backgroundColor: theme.colors.background.primary,
    },
    // Use platform-appropriate transitions for consistency
    // iOS: slide from right, Android: fade with slight slide
    ...Platform.select({
      ios: TransitionPresets.SlideFromRightIOS,
      android: TransitionPresets.FadeFromBottomAndroid,
      default: TransitionPresets.SlideFromRightIOS,
    }),
  }), [theme, mode]);
};

// Create stack navigators for each tab
const HomeStack = () => {
  const { headerStyle, headerTintColor, headerTitleStyle, cardStyle } = useHeaderStyles();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle,
        headerBackTitleVisible: false,
        cardStyle,
        headerRight: () => <HeaderRight />, 
      }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Tournament Maker' }}
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
      <Stack.Screen
        name="CreatePlayer"
        component={CreatePlayerScreen}
        options={{ title: 'Add Player' }}
      />
      <Stack.Screen
        name="CreatePlayerGroup"
        component={CreatePlayerGroupScreen}
        options={{ title: 'Create Group' }}
      />
    </Stack.Navigator>
  );
};

const PlayersStack = () => {
  const { headerStyle, headerTintColor, headerTitleStyle, cardStyle } = useHeaderStyles();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle,
        headerBackTitleVisible: false,
        cardStyle,
        headerRight: () => <HeaderRight />,
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
  const { headerStyle, headerTintColor, headerTitleStyle, cardStyle } = useHeaderStyles();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle,
        headerBackTitleVisible: false,
        cardStyle,
        headerRight: () => <HeaderRight />,
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
  const { headerStyle, headerTintColor, headerTitleStyle, cardStyle } = useHeaderStyles();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle,
        headerBackTitleVisible: false,
        cardStyle,
        headerRight: () => <HeaderRight />,
      }}>
      <Stack.Screen
        name="TournamentHistoryMain"
        component={TournamentHistoryScreen}
        options={{ title: 'Tournament History' }}
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

const BottomTabNavigator = () => {
  const theme = useTheme();

  // Check if CreateTournament screen is currently focused in the Home stack
  const isOnCreateTournament = useNavigationState((state) => {
    const homeTab = state?.routes?.find(r => r.name === 'Home');
    if (!homeTab?.state) return false;
    const homeState = homeTab.state;
    const currentIndex = homeState.index ?? 0;
    const currentRoute = homeState.routes[currentIndex];
    return currentRoute?.name === 'CreateTournament';
  });

  const tabBarStyle = useMemo(() => ({
    backgroundColor: theme.colors.background.primary,
    borderTopColor: theme.colors.border.subtle,
    borderTopWidth: 1,
    paddingBottom: 24,
    paddingTop: 8,
    height: 84,
    // No shadow - just hairline border
    shadowOpacity: 0,
    elevation: 0,
  }), [theme]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.2,
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
      name="CreateTournamentTab"
      component={HomeStack} // We'll navigate to CreateTournament from this
      options={({ navigation }) => ({
        tabBarLabel: '',
        tabBarIcon: () => {
          // Hide FAB when already on CreateTournament screen
          if (isOnCreateTournament) {
            return <View style={{ width: 56, height: 56 }} />;
          }
          return (
            <CreateTournamentButton 
              onPress={() => navigation.navigate('Home', { 
                screen: 'CreateTournament' 
              })}
              backgroundColor={theme.colors.primary}
              iconColor="#FFFFFF"
            />
          );
        },
        tabBarButton: (props) => (
          <View style={{ flex: 1, alignItems: 'center' }}>
            {props.children}
          </View>
        ),
      })}
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
