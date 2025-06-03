# Tournament Maker

A React Native mobile app for managing camping group tournaments with team-based competitions.

## Features

### ✅ Completed Core Features

- **Player Management**: Create, edit, and delete player profiles with gender tracking
- **Team Creation**: Manual and Boy/Girl pairing modes for automatic team generation
- **Tournament Setup**: Create tournaments with selected players and team modes
- **Bracket Generation**: Single-elimination brackets with automatic bye handling
- **Score Tracking**: Large touch-friendly scoring interface with quick score buttons
- **Match Management**: Complete matches and automatic winner advancement
- **Player Groups**: Save frequently used player groups for quick tournament setup
- **Win/Loss Tracking**: Individual player statistics across all tournaments

### 🎯 Key Design Features

- **Outdoor-Friendly UI**: Large touch targets and high contrast colors for sunlight visibility
- **Simple Navigation**: Maximum 3 taps to reach any feature
- **Local Storage**: SQLite database for offline functionality
- **Cross-Platform**: Works on both iOS and Android

## Project Structure

```
TournamentMaker/
├── src/
│   ├── screens/           # All UI screens
│   │   ├── HomeScreen.tsx
│   │   ├── PlayersScreen.tsx
│   │   ├── CreatePlayerScreen.tsx
│   │   ├── CreateTournamentScreen.tsx
│   │   ├── TournamentScreen.tsx
│   │   ├── MatchScreen.tsx
│   │   ├── PlayerGroupsScreen.tsx
│   │   └── CreatePlayerGroupScreen.tsx
│   ├── services/          # Business logic and data services
│   │   ├── DatabaseService.ts
│   │   └── TournamentService.ts
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.tsx
│   └── types/            # TypeScript type definitions
│       └── index.ts
├── App.tsx               # Main app entry point
└── package.json          # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Node.js (>= 18)
- React Native development environment
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

3. **Install iOS dependencies (iOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the app:**
   
   For iOS:
   ```bash
   npm run ios
   ```
   
   For Android:
   ```bash
   npm run android
   ```

## Usage Flow

1. **First Time Setup:**
   - Launch the app
   - Navigate to "Manage Players"
   - Add player profiles with names, nicknames, and gender

2. **Create Tournament:**
   - Go to "Create Tournament"
   - Enter tournament name
   - Choose team creation mode (Manual or Boy/Girl)
   - Select players to participate
   - Create tournament

3. **Play Tournament:**
   - View the generated bracket
   - Tap on matches to enter scores
   - Use quick score buttons (+1, +2, +3) for fast scoring
   - Complete matches to advance winners
   - Continue until champion is determined

4. **Player Groups (Optional):**
   - Create saved groups of frequently used players
   - Use groups for quick tournament setup

## Technical Details

### Dependencies

- **React Native**: Cross-platform mobile framework
- **React Navigation**: Screen navigation and routing
- **SQLite**: Local database storage
- **TypeScript**: Type safety and better development experience

### Database Schema

- **Players**: id, name, nickname, gender, wins, losses, timestamps
- **Teams**: id, player1_id, player2_id, team_name, timestamp
- **Tournaments**: id, name, status, current_round, winner_id, timestamps
- **Matches**: id, tournament_id, team1_id, team2_id, scores, round, completion status
- **Player Groups**: id, name, timestamps
- **Player Group Members**: group_id, player_id relationships

### Architecture

- **MVVM Pattern**: Clear separation between UI, business logic, and data
- **Service Layer**: DatabaseService for data persistence, TournamentService for business logic
- **Type Safety**: Comprehensive TypeScript interfaces for all data models
- **Navigation**: Stack-based navigation with proper parameter typing

## Future Enhancements

- Point differential seeding for advanced bracket generation
- Tournament history and results export
- Multiple bracket types (double elimination, round robin)
- Player statistics and analytics
- Tournament templates and presets
- Photo support for players and tournaments

## Development

### Adding New Features

1. Define types in `src/types/index.ts`
2. Add database methods in `src/services/DatabaseService.ts`
3. Implement business logic in `src/services/TournamentService.ts`
4. Create UI screens in `src/screens/`
5. Update navigation in `src/navigation/AppNavigator.tsx`

### Testing

Run the app in development mode and test all user flows:
- Player creation and management
- Tournament creation with different team modes
- Match scoring and completion
- Player group management

## License

This project is for personal use and camping group tournaments.
