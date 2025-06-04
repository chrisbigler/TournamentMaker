# Tournament Maker

A React Native mobile app for managing camping group tournaments with team-based competitions, built with Expo and featuring a modern ChatGPT-inspired dark theme with professional design components.

## 🏆 Current Features

### ✅ Core Tournament Features
- **Player Management**: Create, edit, and delete player profiles with gender tracking and profile pictures
- **Team Creation**: Manual and Boy/Girl pairing modes for automatic team generation
- **Tournament Setup**: Create tournaments with selected players and team modes
- **Bracket Generation**: Single-elimination brackets with automatic bye handling for odd team counts
- **Score Tracking**: Large touch-friendly scoring interface with quick score buttons (+1, +2, +3)
- **Match Management**: Complete matches with automatic winner advancement
- **Tournament History**: View and manage all past tournaments with status tracking
- **Player Groups**: Save frequently used player groups for quick tournament setup
- **Win/Loss Tracking**: Individual player statistics across all tournaments

### 🎨 Design System Features
- **ChatGPT-Inspired Theme**: Modern dark theme with vibrant green accents
- **Professional UI Components**: Comprehensive component library with consistent styling
- **Profile Pictures**: Image picker integration for player profile photos
- **Responsive Design**: Optimized for mobile devices with outdoor-friendly UI
- **Theme System**: Centralized theming with typography, colors, and spacing scales
- **Accessibility**: WCAG compliant with proper contrast ratios and touch targets

### 📱 Technical Features
- **Expo Integration**: Built with Expo for streamlined development and deployment
- **TypeScript**: Full type safety with comprehensive interface definitions
- **SQLite Database**: Local storage with complex relational data management
- **Navigation**: Stack-based navigation with proper parameter typing
- **Image Management**: Expo ImagePicker for profile pictures with file system integration
- **Cross-Platform**: Works on both iOS and Android

## 📁 Project Structure

```
TournamentMaker/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx       # Primary button component with variants
│   │   ├── Card.tsx         # Card container component
│   │   ├── MenuItem.tsx     # Menu item with icon and variants
│   │   ├── ProfilePicture.tsx # Profile picture with fallback
│   │   ├── TextInput.tsx    # Form input component
│   │   ├── ThemeToggle.tsx  # Theme switching component
│   │   └── index.ts         # Component exports
│   ├── screens/             # All application screens
│   │   ├── HomeScreen.tsx
│   │   ├── PlayersScreen.tsx
│   │   ├── CreatePlayerScreen.tsx
│   │   ├── CreateTournamentScreen.tsx
│   │   ├── TournamentScreen.tsx
│   │   ├── TournamentHistoryScreen.tsx
│   │   ├── MatchScreen.tsx
│   │   ├── PlayerGroupsScreen.tsx
│   │   └── CreatePlayerGroupScreen.tsx
│   ├── services/            # Business logic and data services
│   │   ├── DatabaseService.ts    # SQLite database operations
│   │   ├── TournamentService.ts  # Tournament logic and bracket generation
│   │   └── ImageService.ts       # Image handling and file management
│   ├── theme/               # Complete theming system
│   │   ├── colors.ts        # Color palette definitions
│   │   ├── typography.ts    # Text styles and font scales
│   │   ├── spacing.ts       # Spacing scale system
│   │   ├── createTheme.ts   # Theme creation utilities
│   │   ├── ThemeContext.tsx # React context for theme
│   │   ├── index.ts         # Theme exports
│   │   └── README.md        # Theme system documentation
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx # Stack navigator with all routes
│   └── types/              # TypeScript type definitions
│       └── index.ts        # All interfaces and enums
├── assets/                 # App assets
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── docs/                   # Additional documentation
│   ├── ProjectDetailsDevGuide.mdc  # Core requirements guide
│   ├── DesignDoc.mdc              # Design system specifications
│   └── COLOR_MIGRATION_GUIDE.md   # Theme migration guide
├── scripts/                # Utility scripts
│   ├── debug-tournament.js        # Debug tournament data
│   └── fix-tournaments.js         # Data fixing utilities
├── App.tsx                # Main app entry point with theme provider
├── package.json           # Dependencies and scripts
└── expo.json             # Expo configuration
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (>= 18)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio and emulator (for Android development)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd TournamentMaker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator:**
   ```bash
   # iOS
   npm run ios
   # or press 'i' in the Expo CLI

   # Android  
   npm run android
   # or press 'a' in the Expo CLI

   # Web (for testing)
   npm run web
   # or press 'w' in the Expo CLI
   ```

## 🎯 Usage Flow

### First Time Setup
1. Launch the app
2. Navigate to "Manage Players"
3. Add player profiles with names, nicknames, gender, and optional profile pictures

### Creating a Tournament
1. Go to "Create Tournament"
2. Enter tournament name
3. Choose team creation mode:
   - **Manual**: Select teams manually
   - **Boy/Girl**: Automatically pair one male + one female player
4. Select players to participate (or load a saved player group)
5. Create tournament and view generated bracket

### Playing a Tournament
1. View the tournament bracket
2. Tap on matches to enter scores
3. Use quick score buttons (+1, +2, +3) for fast scoring
4. Complete matches to advance winners automatically
5. Continue until champion is determined

### Managing Player Groups
1. Create saved groups of frequently used players
2. Use groups for quick tournament setup
3. Edit and manage existing groups

### Tournament History
1. View all past tournaments with status indicators
2. Tap on any tournament to view details
3. Clear tournament history if needed (development feature)

## 📊 Data Models

### Core Interfaces

```typescript
interface Player {
  id: string;
  name: string;
  nickname?: string;
  gender: Gender; // 'male' | 'female'
  wins: number;
  losses: number;
  profilePicture?: string; // File path
  createdAt: Date;
  updatedAt: Date;
}

interface Team {
  id: string;
  tournamentId?: string;
  player1: Player;
  player2: Player;
  teamName: string;
  createdAt: Date;
}

interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  status: TournamentStatus; // 'setup' | 'active' | 'completed'
  currentRound: number;
  winner?: Team;
  createdAt: Date;
  updatedAt: Date;
}

interface Match {
  id: string;
  team1: Team;
  team2?: Team; // nullable for byes
  score1: number;
  score2: number;
  round: number;
  isComplete: boolean;
  winner?: Team;
  createdAt: Date;
  updatedAt: Date;
}

interface PlayerGroup {
  id: string;
  name: string;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🏗️ Architecture

### Service Layer
- **DatabaseService**: SQLite operations with full CRUD for all entities
- **TournamentService**: Tournament logic, bracket generation, and match management
- **ImageService**: Image handling, file system operations, and cleanup

### Component System
- **Reusable Components**: Button, Card, MenuItem, TextInput, ProfilePicture
- **Consistent Theming**: All components use the centralized theme system
- **TypeScript**: Full type safety with proper prop interfaces

### Navigation
- **Stack Navigation**: Type-safe navigation with parameter validation
- **Nested Navigators**: Organized navigation structure with proper screen grouping

### Database Schema
```sql
-- Tables with proper relationships and constraints
Players (id, name, nickname, gender, wins, losses, profile_picture, created_at, updated_at)
Teams (id, player1_id, player2_id, team_name, created_at)
Tournaments (id, name, status, current_round, winner_id, created_at, updated_at)
Matches (id, tournament_id, team1_id, team2_id, score1, score2, round, is_complete, winner_id, created_at, updated_at)
PlayerGroups (id, name, created_at, updated_at)
PlayerGroupMembers (id, group_id, player_id)
```

## 🎨 Theme System

### ChatGPT-Inspired Design
- **Primary**: ChatGPT Green (#10A37F) for main actions
- **Background**: Deep grays (#343541, #444654) for modern dark theme
- **Text**: Off-white (#ECECF1) with proper contrast ratios
- **Accents**: Success, warning, error, and info colors

### Typography Scale
- **Headings**: h1 (32px) → h4 (20px) with appropriate weights
- **Body**: 16px normal, with large (18px) and small (14px) variants
- **Utility**: Caption (12px), label (14px), button (16px semibold)

### Spacing System
- **Scale**: 4px increments from xs (4px) to 8xl (96px)
- **Consistent**: All components use the centralized spacing values

## 🔧 Development Guidelines

### Adding New Features
1. **Define Types**: Add interfaces to `src/types/index.ts`
2. **Database Layer**: Add methods to `src/services/DatabaseService.ts`
3. **Business Logic**: Implement in appropriate service (TournamentService, etc.)
4. **UI Components**: Create reusable components in `src/components/`
5. **Screens**: Build screens using existing components and theme
6. **Navigation**: Update `src/navigation/AppNavigator.tsx` with new routes

### Code Standards
- **TypeScript**: All code must be fully typed
- **Theme Usage**: Always use theme values, never hardcoded styles
- **Component Composition**: Build complex UIs from simple, reusable components
- **Error Handling**: Proper error handling with user-friendly messages
- **Accessibility**: Include proper labels, roles, and touch targets

### Testing
Test all user flows in development:
- Player creation with profile pictures
- Tournament creation with both team modes
- Match scoring and completion
- Player group management
- Tournament history navigation
- Theme consistency across screens

## 📦 Key Dependencies

```json
{
  "expo": "~53.0.0",
  "react": "19.0.0",
  "react-native": "0.79.2",
  "@react-navigation/native": "^6.1.17",
  "@react-navigation/stack": "^6.3.29",
  "expo-sqlite": "~15.2.10",
  "expo-image-picker": "^16.1.4",
  "expo-file-system": "^18.1.10",
  "typescript": "~5.8.3"
}
```

## 🚀 Future Enhancements

### Planned Features
- **Advanced Seeding**: Point differential seeding for bracket generation
- **Multiple Bracket Types**: Double elimination, round robin tournaments
- **Data Export**: Tournament results and player statistics export
- **Advanced Analytics**: Player performance trends and insights
- **Tournament Templates**: Preset tournament configurations
- **Photo Integration**: Tournament and match photos

### Technical Improvements
- **Cloud Sync**: Optional cloud backup and sync across devices
- **Offline Optimization**: Enhanced offline functionality
- **Performance**: Optimizations for large tournaments
- **Testing**: Comprehensive unit and integration tests

## 📄 License

This project is for personal use and camping group tournaments.

---

## 📚 Additional Documentation

- **Theme System**: See `src/theme/README.md` for detailed theming guide
- **Development Guide**: See `ProjectDetailsDevGuide.mdc` for core requirements
- **Design Specifications**: See `DesignDoc.mdc` for design system details
- **Migration Guide**: See `COLOR_MIGRATION_GUIDE.md` for theme migration info

For any questions or issues, refer to the comprehensive type definitions in `src/types/index.ts` and the service layer documentation within each service file.
