import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import { useTheme } from '../theme';
import { useThemeMode } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import ThemeToggle from '../components/ThemeToggle';
import { TouchableOpacity, View } from 'react-native';

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
  const { mode } = useThemeMode();
  
  const headerStyle = {
    backgroundColor: mode === 'light' ? theme.colors.background.pureWhite : theme.colors.primary.deepNavy,
    ...theme.shadows.card,
  };
  
  const headerTintColor = mode === 'light' ? theme.colors.text.richBlack : theme.colors.text.white;
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: headerTintColor,
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
    </Stack.Navigator>
  );
};

const PlayersStack = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  
  const headerStyle = {
    backgroundColor: mode === 'light' ? theme.colors.background.pureWhite : theme.colors.primary.deepNavy,
    ...theme.shadows.card,
  };
  
  const headerTintColor = mode === 'light' ? theme.colors.text.richBlack : theme.colors.text.white;
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: headerTintColor,
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
  const { mode } = useThemeMode();
  
  const headerStyle = {
    backgroundColor: mode === 'light' ? theme.colors.background.pureWhite : theme.colors.primary.deepNavy,
    ...theme.shadows.card,
  };
  
  const headerTintColor = mode === 'light' ? theme.colors.text.richBlack : theme.colors.text.white;
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: headerTintColor,
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
  const { mode } = useThemeMode();
  
  const headerStyle = {
    backgroundColor: mode === 'light' ? theme.colors.background.pureWhite : theme.colors.primary.deepNavy,
    ...theme.shadows.card,
  };
  
  const headerTintColor = mode === 'light' ? theme.colors.text.richBlack : theme.colors.text.white;
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle: {
          fontWeight: theme.textStyles.h3.fontWeight,
          fontSize: theme.textStyles.h3.fontSize,
          color: headerTintColor,
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

  // Custom plus button component
  const CreateTournamentButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity
      style={{
        top: -15,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: theme.colors.accent.successGreen,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialIcons name="add" size={32} color={theme.colors.text.white} />
    </TouchableOpacity>
  );

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
      name="CreateTournamentTab"
      component={HomeStack} // We'll navigate to CreateTournament from this
      options={({ navigation }) => ({
        tabBarLabel: '',
        tabBarIcon: () => (
          <CreateTournamentButton 
            onPress={() => navigation.navigate('Home', { 
              screen: 'CreateTournament' 
            })} 
          />
        ),
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