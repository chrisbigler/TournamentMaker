export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum TournamentStatus {
  SETUP = 'setup',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  gender: Gender;
  wins: number;
  losses: number;
  profilePicture?: string; // Path to the profile picture file
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  tournamentId?: string; // Optional for backwards compatibility
  player1: Player;
  player2: Player;
  teamName: string;
  createdAt: Date;
}

export interface Match {
  id: string;
  team1: Team;
  team2?: Team; // nullable for bye
  score1: number;
  score2: number;
  round: number;
  isComplete: boolean;
  winner?: Team;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  status: TournamentStatus;
  currentRound: number;
  winner?: Team;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerGroup {
  id: string;
  name: string;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}

// Serialized version for navigation
export interface SerializedPlayerGroup {
  id: string;
  name: string;
  players: Array<Omit<Player, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  HomeMain: undefined;
  Players: undefined;
  PlayersMain: undefined;
  CreatePlayer: { player?: Player };
  Teams: undefined;
  CreateTournament: undefined;
  Tournament: { tournamentId: string };
  Match: { matchId: string; tournamentId: string };
  PlayerGroups: undefined;
  PlayerGroupsMain: undefined;
  CreatePlayerGroup: { group?: SerializedPlayerGroup };
  TournamentHistory: undefined;
  TournamentHistoryMain: undefined;
};

// Database types
export interface DatabasePlayer {
  id: string;
  name: string;
  nickname: string | null;
  gender: string;
  wins: number;
  losses: number;
  profile_picture: string | null; // Path to the profile picture file
  created_at: string;
  updated_at: string;
}

export interface DatabaseTeam {
  id: string;
  player1_id: string;
  player2_id: string;
  team_name: string;
  created_at: string;
}

export interface DatabaseMatch {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string | null;
  score1: number;
  score2: number;
  round: number;
  is_complete: number; // SQLite boolean as integer
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTournament {
  id: string;
  name: string;
  status: string;
  current_round: number;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabasePlayerGroup {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DatabasePlayerGroupMember {
  id: string;
  group_id: string;
  player_id: string;
} 