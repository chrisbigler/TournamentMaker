# Tournament Maker Architecture

## Overview
- Tournament Maker is a React Native app built with Expo, focused on offline-first tournament management for small groups.
- Data is stored locally in SQLite and exposed through a service layer to the screens.
- A centralized theme system provides consistent styling across components and screens.

## Product Scope and Flow
- Primary workflows: manage players, create teams, build tournaments, score matches, and review history.
- User flow: create players, create a tournament, score matches to completion, then view results and stats.
- Tournament format: single-elimination brackets with automatic bye handling.
- Financials: optional buy-in, prize pool calculation, and payout display.

## Runtime Stack
- React 19 + React Native 0.79
- Expo SDK 53
- React Navigation (stack and bottom tabs)
- SQLite via `expo-sqlite`
- Image selection and storage via `expo-image-picker` and `expo-file-system`
- Gradients via `expo-linear-gradient`

## High-Level Flow

```
+---------------------------+
|         UI Layer          |
+---------------------------+
            |
+---------------------------+
| Services and Utilities    |
+---------------------------+
            |
+---------------------------+
|      DatabaseService      |
+---------------------------+
```

## Entry Points
- `index.js` registers the root component with Expo.
- `App.tsx` wraps the app in `ThemeProvider` and renders `AppNavigator`.

## Navigation Structure
- Bottom tabs: Home, Players, Create Tournament (FAB), Groups, History.
- Each tab hosts a stack navigator for screen-specific flows.
- The Create Tournament tab uses a floating action button that navigates to the Create Tournament screen and hides itself when already focused.
- Screen transitions are platform-specific for consistent native feel.

## Domain Model
- Player: identity, gender, win and loss stats, optional profile picture.
- Team: two players, team name, optional tournament association.
- Match: team1, optional team2 for byes, scores, round, completion state, winner.
- Tournament: name, teams, matches, status, round, buy-in, pot, optional winner.
- PlayerGroup: named collections of players for quick tournament setup.
 - Gender is currently constrained to `male` and `female` in code.

## Data Storage
- SQLite schema includes players, teams, tournaments, matches, player groups, and group members.
- Migrations add missing columns for profile pictures and buy-in and pot when needed.
- Indexes support common foreign key lookups.
- Join queries are used to load teams and matches with player data in a single query.
- `getAllTournaments` and `getAllPlayerGroups` iterate per item to assemble full objects.

## Service Layer
- `DatabaseService` abstracts all SQLite access and data mapping to domain objects.
- `TournamentService` owns tournament rules and lifecycle:
- Team generation (random pairing or boy and girl pairing).
- Bracket generation with bye handling.
- Match updates, progression to next rounds, and tournament completion.
- Player stats updates and stats repair utilities.
- Bracket repair for legacy tournaments missing matches.
- `ImageService` handles image pick, capture, local file storage, and cleanup.

## UI Layer
- Screens focus on specific workflows:
- HomeScreen initializes the database and exposes core actions.
- PlayersScreen manages player list, search, and stats display.
- CreatePlayerScreen creates and edits players, including profile pictures.
- PlayerGroupsScreen lists saved groups and navigates to edit.
- CreatePlayerGroupScreen creates and edits groups with player selection.
- CreateTournamentScreen builds a tournament from players or groups and sets buy-in.
- TournamentScreen displays the bracket, status, and payouts.
- MatchScreen handles scoring and match completion.
- TournamentHistoryScreen lists tournaments with search and status.

## Design System
- `createTheme.ts` builds light and dark themes from shared tokens.
- `colors.ts`, `spacing.ts`, and `typography.ts` define global tokens.
- Components are styled with theme tokens, with legacy aliases retained for compatibility.
- Reusable components: Button, Card, MenuItem, TextInput, ProfilePicture, ThemeToggle, ScreenHeader.

## Utilities and Diagnostics
- Currency utilities provide consistent USD parsing and formatting.
- Debug scripts exist for tournament diagnostics and manual fixes.
- Jest includes a basic render test for the app shell.
- `tests/refactor-test-cases.yaml` defines validation scenarios for performance, iOS readiness, and visual redesign.

## Platform Configuration
- `app.json` defines Expo metadata, icons, and platform settings.
- iOS includes photo library and camera usage descriptions.
- Android package is configured in Expo and a native Android project exists for local builds.

## Known Design Considerations
- Data loading for tournament and group lists is functional but can be optimized further for large datasets.
- Some screens still use direct color values alongside theme tokens.
