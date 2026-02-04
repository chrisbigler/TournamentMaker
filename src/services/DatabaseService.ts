import * as SQLite from 'expo-sqlite';
import {
  DatabasePlayer,
  DatabaseTeam,
  DatabaseMatch,
  DatabaseTournament,
  DatabasePlayerGroup,
  DatabasePlayerGroupMember,
  Player,
  Team,
  Match,
  Tournament,
  PlayerGroup,
  Gender,
  TournamentStatus,
} from '../types';

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      this.database = SQLite.openDatabaseSync('TournamentMaker.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const createPlayersTable = `
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nickname TEXT,
        gender TEXT NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        profile_picture TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    const createTeamsTable = `
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        tournament_id TEXT,
        player1_id TEXT NOT NULL,
        player2_id TEXT NOT NULL,
        team_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
        FOREIGN KEY (player1_id) REFERENCES players (id),
        FOREIGN KEY (player2_id) REFERENCES players (id)
      );
    `;

    const createTournamentsTable = `
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        current_round INTEGER DEFAULT 1,
        buy_in REAL DEFAULT 0,
        pot REAL DEFAULT 0,
        winner_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (winner_id) REFERENCES teams (id)
      );
    `;

    const createMatchesTable = `
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        tournament_id TEXT NOT NULL,
        team1_id TEXT NOT NULL,
        team2_id TEXT,
        score1 INTEGER DEFAULT 0,
        score2 INTEGER DEFAULT 0,
        round INTEGER NOT NULL,
        is_complete INTEGER DEFAULT 0,
        winner_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
        FOREIGN KEY (team1_id) REFERENCES teams (id),
        FOREIGN KEY (team2_id) REFERENCES teams (id),
        FOREIGN KEY (winner_id) REFERENCES teams (id)
      );
    `;

    const createPlayerGroupsTable = `
      CREATE TABLE IF NOT EXISTS player_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    const createPlayerGroupMembersTable = `
      CREATE TABLE IF NOT EXISTS player_group_members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        player_id TEXT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES player_groups (id),
        FOREIGN KEY (player_id) REFERENCES players (id),
        UNIQUE(group_id, player_id)
      );
    `;

    try {
      // Execute all table creation queries
      this.database.execSync(createPlayersTable);
      this.database.execSync(createTeamsTable);
      this.database.execSync(createTournamentsTable);
      this.database.execSync(createMatchesTable);
      this.database.execSync(createPlayerGroupsTable);
      this.database.execSync(createPlayerGroupMembersTable);
      
      // Create indexes for foreign keys to improve query performance
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_teams_player1_id ON teams(player1_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_teams_player2_id ON teams(player2_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_matches_team1_id ON matches(team1_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_matches_team2_id ON matches(team2_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_matches_winner_id ON matches(winner_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_player_group_members_group_id ON player_group_members(group_id)');
      this.database.execSync('CREATE INDEX IF NOT EXISTS idx_player_group_members_player_id ON player_group_members(player_id)');
      
      // Run migrations after table creation
      await this.runMigrations();
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    try {
      // Migration 1: Add tournament_id to teams table if it doesn't exist
      const teamsInfo = this.database.getAllSync("PRAGMA table_info(teams);") as Array<{ name: string }>;
      const hasGroupIdColumn = teamsInfo.some((col) => col.name === 'tournament_id');
      
      if (!hasGroupIdColumn) {
        this.database.execSync('ALTER TABLE teams ADD COLUMN tournament_id TEXT;');
      }

      // Migration 2: Add profile_picture to players table if it doesn't exist
      const playersInfo = this.database.getAllSync("PRAGMA table_info(players);") as Array<{ name: string }>;
      const hasProfilePictureColumn = playersInfo.some((col) => col.name === 'profile_picture');

      if (!hasProfilePictureColumn) {
        this.database.execSync('ALTER TABLE players ADD COLUMN profile_picture TEXT;');
      }

      // Migration 3: Add buy_in and pot columns to tournaments table if they don't exist
      const tournamentsInfo = this.database.getAllSync("PRAGMA table_info(tournaments);") as Array<{ name: string }>;
      const hasBuyInColumn = tournamentsInfo.some((col) => col.name === 'buy_in');
      const hasPotColumn = tournamentsInfo.some((col) => col.name === 'pot');

      if (!hasBuyInColumn) {
        this.database.execSync('ALTER TABLE tournaments ADD COLUMN buy_in REAL DEFAULT 0;');
      }

      if (!hasPotColumn) {
        this.database.execSync('ALTER TABLE tournaments ADD COLUMN pot REAL DEFAULT 0;');
      }

      // Migration 4: Add total_winnings to players table if it doesn't exist
      const hasTotalWinningsColumn = playersInfo.some((col) => col.name === 'total_winnings');

      if (!hasTotalWinningsColumn) {
        this.database.execSync('ALTER TABLE players ADD COLUMN total_winnings REAL DEFAULT 0;');
      }
    } catch (error) {
      console.error('Failed to run migrations:', error);
      throw error;
    }
  }

  // Player operations
  async createPlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
    if (!this.database) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'INSERT INTO players (id, name, nickname, gender, wins, losses, total_winnings, profile_picture, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, player.name, player.nickname || null, player.gender, player.wins, player.losses, 0, player.profilePicture || null, now, now]
      );

      return {
        id,
        ...player,
        totalWinnings: 0,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    } catch (error) {
      console.error('Failed to create player:', error);
      throw error;
    }
  }

  async getAllPlayers(): Promise<Player[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const rows = this.database.getAllSync('SELECT * FROM players ORDER BY name') as DatabasePlayer[];
      
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        nickname: row.nickname || undefined,
        gender: row.gender as Gender,
        wins: row.wins,
        losses: row.losses,
        totalWinnings: row.total_winnings || 0,
        profilePicture: row.profile_picture || undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      console.error('Failed to get all players:', error);
      throw error;
    }
  }

  async updatePlayerStats(playerId: string, wins: number, losses: number): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'UPDATE players SET wins = ?, losses = ?, updated_at = ? WHERE id = ?',
        [wins, losses, now, playerId]
      );
    } catch (error) {
      console.error('Failed to update player stats:', error);
      throw error;
    }
  }

  async updatePlayerWinnings(playerId: string, amount: number): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'UPDATE players SET total_winnings = total_winnings + ?, updated_at = ? WHERE id = ?',
        [amount, now, playerId]
      );
    } catch (error) {
      console.error('Failed to update player winnings:', error);
      throw error;
    }
  }

  async setPlayerWinnings(playerId: string, amount: number): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'UPDATE players SET total_winnings = ?, updated_at = ? WHERE id = ?',
        [amount, now, playerId]
      );
    } catch (error) {
      console.error('Failed to set player winnings:', error);
      throw error;
    }
  }

  async updatePlayer(playerId: string, player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'UPDATE players SET name = ?, nickname = ?, gender = ?, wins = ?, losses = ?, total_winnings = ?, profile_picture = ?, updated_at = ? WHERE id = ?',
        [player.name, player.nickname || null, player.gender, player.wins, player.losses, player.totalWinnings, player.profilePicture || null, now, playerId]
      );
    } catch (error) {
      console.error('Failed to update player:', error);
      throw error;
    }
  }

  async deletePlayer(playerId: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      this.database.runSync('DELETE FROM players WHERE id = ?', [playerId]);
    } catch (error) {
      console.error('Failed to delete player:', error);
      throw error;
    }
  }

  // Team operations
  async createTeam(team: Omit<Team, 'id' | 'createdAt'>, tournamentId?: string): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'INSERT INTO teams (id, tournament_id, player1_id, player2_id, team_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, tournamentId || team.tournamentId || null, team.player1.id, team.player2.id, team.teamName, now]
      );
      return id;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  }

  async getTeam(teamId: string): Promise<Team | null> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const row = this.database.getFirstSync(
        `SELECT t.*, t.tournament_id,
         p1.id as p1_id, p1.name as p1_name, p1.nickname as p1_nickname, p1.gender as p1_gender, p1.wins as p1_wins, p1.losses as p1_losses, p1.total_winnings as p1_total_winnings, p1.profile_picture as p1_profile_picture, p1.created_at as p1_created_at, p1.updated_at as p1_updated_at,
         p2.id as p2_id, p2.name as p2_name, p2.nickname as p2_nickname, p2.gender as p2_gender, p2.wins as p2_wins, p2.losses as p2_losses, p2.total_winnings as p2_total_winnings, p2.profile_picture as p2_profile_picture, p2.created_at as p2_created_at, p2.updated_at as p2_updated_at
         FROM teams t
         JOIN players p1 ON t.player1_id = p1.id
         JOIN players p2 ON t.player2_id = p2.id
         WHERE t.id = ?`,
        [teamId]
      ) as any;

      if (!row) {
        return null;
      }

      const team: Team = {
        id: row.id,
        tournamentId: row.tournament_id || undefined,
        player1: {
          id: row.p1_id,
          name: row.p1_name,
          nickname: row.p1_nickname || undefined,
          gender: row.p1_gender as Gender,
          wins: row.p1_wins,
          losses: row.p1_losses,
          totalWinnings: row.p1_total_winnings || 0,
          profilePicture: row.p1_profile_picture || undefined,
          createdAt: new Date(row.p1_created_at),
          updatedAt: new Date(row.p1_updated_at),
        },
        player2: {
          id: row.p2_id,
          name: row.p2_name,
          nickname: row.p2_nickname || undefined,
          gender: row.p2_gender as Gender,
          wins: row.p2_wins,
          losses: row.p2_losses,
          totalWinnings: row.p2_total_winnings || 0,
          profilePicture: row.p2_profile_picture || undefined,
          createdAt: new Date(row.p2_created_at),
          updatedAt: new Date(row.p2_updated_at),
        },
        teamName: row.team_name,
        createdAt: new Date(row.created_at),
      };
      return team;
    } catch (error) {
      console.error('Failed to get team:', error);
      throw error;
    }
  }

  // Match operations
  async createMatch(match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>, tournamentId: string): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'INSERT INTO matches (id, tournament_id, team1_id, team2_id, score1, score2, round, is_complete, winner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id, 
          tournamentId, 
          match.team1.id, 
          match.team2?.id || null, 
          match.score1, 
          match.score2, 
          match.round, 
          match.isComplete ? 1 : 0, 
          match.winner?.id || null, 
          now, 
          now
        ]
      );
      return id;
    } catch (error) {
      console.error('Failed to create match:', error);
      throw error;
    }
  }

  async updateMatch(matchId: string, updates: {
    score1?: number;
    score2?: number;
    isComplete?: boolean;
    winnerId?: string;
  }): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    try {
      // Build dynamic update query
      const setClause = [];
      const values = [];

      if (updates.score1 !== undefined) {
        setClause.push('score1 = ?');
        values.push(updates.score1);
      }
      if (updates.score2 !== undefined) {
        setClause.push('score2 = ?');
        values.push(updates.score2);
      }
      if (updates.isComplete !== undefined) {
        setClause.push('is_complete = ?');
        values.push(updates.isComplete ? 1 : 0);
      }
      if (updates.winnerId !== undefined) {
        setClause.push('winner_id = ?');
        values.push(updates.winnerId);
      }

      setClause.push('updated_at = ?');
      values.push(now);
      values.push(matchId);

      const query = `UPDATE matches SET ${setClause.join(', ')} WHERE id = ?`;

      this.database.runSync(query, values);
    } catch (error) {
      console.error('Failed to update match:', error);
      throw error;
    }
  }

  async getMatch(matchId: string): Promise<Match | null> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const row = this.database.getFirstSync(
        'SELECT * FROM matches WHERE id = ?',
        [matchId]
      ) as DatabaseMatch | null;

      if (!row) {
        return null;
      }

      const team1 = await this.getTeam(row.team1_id);
      const team2 = row.team2_id ? await this.getTeam(row.team2_id) : undefined;
      const winner = row.winner_id ? await this.getTeam(row.winner_id) : undefined;
      
      if (team1) {
        const match: Match = {
          id: row.id,
          team1,
          team2: team2 || undefined,
          score1: row.score1,
          score2: row.score2,
          round: row.round,
          isComplete: row.is_complete === 1,
          winner: winner || undefined,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
        return match;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get match:', error);
      throw error;
    }
  }

  // Tournament operations
  async createTournament(tournament: {
    name: string;
    status: TournamentStatus;
    currentRound: number;
    buyIn: number;
    pot: number;
    winner?: Team;
  }): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    try {
      this.database.runSync(
        'INSERT INTO tournaments (id, name, status, current_round, buy_in, pot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, tournament.name, tournament.status, tournament.currentRound, tournament.buyIn, tournament.pot, now, now]
      );
      return id;
    } catch (error) {
      console.error('Failed to create tournament:', error);
      throw error;
    }
  }

  async getTournament(id: string): Promise<Tournament | null> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const row = this.database.getFirstSync(
        'SELECT * FROM tournaments WHERE id = ?',
        [id]
      ) as DatabaseTournament | null;

      if (!row) {
        return null;
      }
      
      // Get teams and matches for this tournament
      const teams = await this.getTeamsForTournament(id);
      const matches = await this.getMatchesForTournament(id);

      return {
        id: row.id,
        name: row.name,
        teams,
        matches,
        status: row.status as TournamentStatus,
        currentRound: row.current_round,
        buyIn: row.buy_in,
        pot: row.pot,
        winner: row.winner_id ? teams.find(t => t.id === row.winner_id) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      console.error('Failed to get tournament:', error);
      throw error;
    }
  }

  async getAllTournaments(): Promise<Tournament[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const rows = this.database.getAllSync(
        'SELECT * FROM tournaments ORDER BY created_at DESC'
      ) as DatabaseTournament[];

      const tournaments: Tournament[] = [];
      
      for (const row of rows) {
        // Get teams and matches for this tournament
        const teams = await this.getTeamsForTournament(row.id);
        const matches = await this.getMatchesForTournament(row.id);

        tournaments.push({
          id: row.id,
          name: row.name,
          teams,
          matches,
          status: row.status as TournamentStatus,
          currentRound: row.current_round,
          buyIn: row.buy_in,
          pot: row.pot,
          winner: row.winner_id ? teams.find(t => t.id === row.winner_id) : undefined,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });
      }
      
      return tournaments;
    } catch (error) {
      console.error('Failed to get all tournaments:', error);
      throw error;
    }
  }

  async updateTournament(tournamentId: string, updates: {
    name?: string;
    status?: TournamentStatus;
    currentRound?: number;
    winnerId?: string;
    buyIn?: number;
    pot?: number;
  }): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    try {
      // Build dynamic update query
      const setClause = [];
      const values = [];

      if (updates.name !== undefined) {
        setClause.push('name = ?');
        values.push(updates.name);
      }
      if (updates.status !== undefined) {
        setClause.push('status = ?');
        values.push(updates.status);
      }
      if (updates.currentRound !== undefined) {
        setClause.push('current_round = ?');
        values.push(updates.currentRound);
      }
      if (updates.winnerId !== undefined) {
        setClause.push('winner_id = ?');
        values.push(updates.winnerId);
      }
      if (updates.buyIn !== undefined) {
        setClause.push('buy_in = ?');
        values.push(updates.buyIn);
      }
      if (updates.pot !== undefined) {
        setClause.push('pot = ?');
        values.push(updates.pot);
      }

      setClause.push('updated_at = ?');
      values.push(now);
      values.push(tournamentId);

      const query = `UPDATE tournaments SET ${setClause.join(', ')} WHERE id = ?`;

      this.database.runSync(query, values);
    } catch (error) {
      console.error('Failed to update tournament:', error);
      throw error;
    }
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Delete in order due to foreign key constraints
      // 1. Delete matches first
      this.database.runSync(
        'DELETE FROM matches WHERE tournament_id = ?',
        [tournamentId]
      );

      // 2. Delete teams
      this.database.runSync(
        'DELETE FROM teams WHERE tournament_id = ?',
        [tournamentId]
      );

      // 3. Delete tournament
      this.database.runSync(
        'DELETE FROM tournaments WHERE id = ?',
        [tournamentId]
      );
    } catch (error) {
      console.error('Failed to delete tournament:', error);
      throw error;
    }
  }

  async clearAllTournaments(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Delete all matches first
      this.database.runSync('DELETE FROM matches');

      // Delete all teams
      this.database.runSync('DELETE FROM teams');

      // Delete all tournaments
      this.database.runSync('DELETE FROM tournaments');
    } catch (error) {
      console.error('Failed to clear all tournaments:', error);
      throw error;
    }
  }

  private async getTeamsForTournament(tournamentId: string): Promise<Team[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Single JOIN query to get all teams with player data
      const rows = this.database.getAllSync(
        `SELECT t.id, t.tournament_id, t.team_name, t.created_at,
         p1.id as p1_id, p1.name as p1_name, p1.nickname as p1_nickname, p1.gender as p1_gender,
         p1.wins as p1_wins, p1.losses as p1_losses, p1.total_winnings as p1_total_winnings, p1.profile_picture as p1_profile_picture,
         p1.created_at as p1_created_at, p1.updated_at as p1_updated_at,
         p2.id as p2_id, p2.name as p2_name, p2.nickname as p2_nickname, p2.gender as p2_gender,
         p2.wins as p2_wins, p2.losses as p2_losses, p2.total_winnings as p2_total_winnings, p2.profile_picture as p2_profile_picture,
         p2.created_at as p2_created_at, p2.updated_at as p2_updated_at
         FROM teams t
         JOIN players p1 ON t.player1_id = p1.id
         JOIN players p2 ON t.player2_id = p2.id
         WHERE t.tournament_id = ?
         ORDER BY t.created_at`,
        [tournamentId]
      ) as any[];

      return rows.map((row) => ({
        id: row.id,
        tournamentId: row.tournament_id || undefined,
        player1: {
          id: row.p1_id,
          name: row.p1_name,
          nickname: row.p1_nickname || undefined,
          gender: row.p1_gender as Gender,
          wins: row.p1_wins,
          losses: row.p1_losses,
          totalWinnings: row.p1_total_winnings || 0,
          profilePicture: row.p1_profile_picture || undefined,
          createdAt: new Date(row.p1_created_at),
          updatedAt: new Date(row.p1_updated_at),
        },
        player2: {
          id: row.p2_id,
          name: row.p2_name,
          nickname: row.p2_nickname || undefined,
          gender: row.p2_gender as Gender,
          wins: row.p2_wins,
          losses: row.p2_losses,
          totalWinnings: row.p2_total_winnings || 0,
          profilePicture: row.p2_profile_picture || undefined,
          createdAt: new Date(row.p2_created_at),
          updatedAt: new Date(row.p2_updated_at),
        },
        teamName: row.team_name,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Error querying teams:', error);
      throw error;
    }
  }

  private async getMatchesForTournament(tournamentId: string): Promise<Match[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Single JOIN query to get all matches with team and player data
      const rows = this.database.getAllSync(
        `SELECT m.id, m.tournament_id, m.score1, m.score2, m.round, m.is_complete,
         m.created_at, m.updated_at,
         -- Team 1 data
         t1.id as t1_id, t1.tournament_id as t1_tournament_id, t1.team_name as t1_team_name, t1.created_at as t1_created_at,
         t1p1.id as t1p1_id, t1p1.name as t1p1_name, t1p1.nickname as t1p1_nickname, t1p1.gender as t1p1_gender,
         t1p1.wins as t1p1_wins, t1p1.losses as t1p1_losses, t1p1.total_winnings as t1p1_total_winnings, t1p1.profile_picture as t1p1_profile_picture,
         t1p1.created_at as t1p1_created_at, t1p1.updated_at as t1p1_updated_at,
         t1p2.id as t1p2_id, t1p2.name as t1p2_name, t1p2.nickname as t1p2_nickname, t1p2.gender as t1p2_gender,
         t1p2.wins as t1p2_wins, t1p2.losses as t1p2_losses, t1p2.total_winnings as t1p2_total_winnings, t1p2.profile_picture as t1p2_profile_picture,
         t1p2.created_at as t1p2_created_at, t1p2.updated_at as t1p2_updated_at,
         -- Team 2 data (nullable for bye)
         t2.id as t2_id, t2.tournament_id as t2_tournament_id, t2.team_name as t2_team_name, t2.created_at as t2_created_at,
         t2p1.id as t2p1_id, t2p1.name as t2p1_name, t2p1.nickname as t2p1_nickname, t2p1.gender as t2p1_gender,
         t2p1.wins as t2p1_wins, t2p1.losses as t2p1_losses, t2p1.total_winnings as t2p1_total_winnings, t2p1.profile_picture as t2p1_profile_picture,
         t2p1.created_at as t2p1_created_at, t2p1.updated_at as t2p1_updated_at,
         t2p2.id as t2p2_id, t2p2.name as t2p2_name, t2p2.nickname as t2p2_nickname, t2p2.gender as t2p2_gender,
         t2p2.wins as t2p2_wins, t2p2.losses as t2p2_losses, t2p2.total_winnings as t2p2_total_winnings, t2p2.profile_picture as t2p2_profile_picture,
         t2p2.created_at as t2p2_created_at, t2p2.updated_at as t2p2_updated_at,
         -- Winner data (nullable)
         tw.id as tw_id, tw.tournament_id as tw_tournament_id, tw.team_name as tw_team_name, tw.created_at as tw_created_at,
         twp1.id as twp1_id, twp1.name as twp1_name, twp1.nickname as twp1_nickname, twp1.gender as twp1_gender,
         twp1.wins as twp1_wins, twp1.losses as twp1_losses, twp1.total_winnings as twp1_total_winnings, twp1.profile_picture as twp1_profile_picture,
         twp1.created_at as twp1_created_at, twp1.updated_at as twp1_updated_at,
         twp2.id as twp2_id, twp2.name as twp2_name, twp2.nickname as twp2_nickname, twp2.gender as twp2_gender,
         twp2.wins as twp2_wins, twp2.losses as twp2_losses, twp2.total_winnings as twp2_total_winnings, twp2.profile_picture as twp2_profile_picture,
         twp2.created_at as twp2_created_at, twp2.updated_at as twp2_updated_at
         FROM matches m
         -- Team 1 joins (required)
         JOIN teams t1 ON m.team1_id = t1.id
         JOIN players t1p1 ON t1.player1_id = t1p1.id
         JOIN players t1p2 ON t1.player2_id = t1p2.id
         -- Team 2 joins (optional for bye)
         LEFT JOIN teams t2 ON m.team2_id = t2.id
         LEFT JOIN players t2p1 ON t2.player1_id = t2p1.id
         LEFT JOIN players t2p2 ON t2.player2_id = t2p2.id
         -- Winner joins (optional)
         LEFT JOIN teams tw ON m.winner_id = tw.id
         LEFT JOIN players twp1 ON tw.player1_id = twp1.id
         LEFT JOIN players twp2 ON tw.player2_id = twp2.id
         WHERE m.tournament_id = ?
         ORDER BY m.round, m.created_at`,
        [tournamentId]
      ) as any[];

      return rows.map((row) => {
        // Build team1 (always present)
        const team1: Team = {
          id: row.t1_id,
          tournamentId: row.t1_tournament_id || undefined,
          player1: {
            id: row.t1p1_id,
            name: row.t1p1_name,
            nickname: row.t1p1_nickname || undefined,
            gender: row.t1p1_gender as Gender,
            wins: row.t1p1_wins,
            losses: row.t1p1_losses,
            totalWinnings: row.t1p1_total_winnings || 0,
            profilePicture: row.t1p1_profile_picture || undefined,
            createdAt: new Date(row.t1p1_created_at),
            updatedAt: new Date(row.t1p1_updated_at),
          },
          player2: {
            id: row.t1p2_id,
            name: row.t1p2_name,
            nickname: row.t1p2_nickname || undefined,
            gender: row.t1p2_gender as Gender,
            wins: row.t1p2_wins,
            losses: row.t1p2_losses,
            totalWinnings: row.t1p2_total_winnings || 0,
            profilePicture: row.t1p2_profile_picture || undefined,
            createdAt: new Date(row.t1p2_created_at),
            updatedAt: new Date(row.t1p2_updated_at),
          },
          teamName: row.t1_team_name,
          createdAt: new Date(row.t1_created_at),
        };

        // Build team2 (optional for bye)
        let team2: Team | undefined;
        if (row.t2_id) {
          team2 = {
            id: row.t2_id,
            tournamentId: row.t2_tournament_id || undefined,
            player1: {
              id: row.t2p1_id,
              name: row.t2p1_name,
              nickname: row.t2p1_nickname || undefined,
              gender: row.t2p1_gender as Gender,
              wins: row.t2p1_wins,
              losses: row.t2p1_losses,
              totalWinnings: row.t2p1_total_winnings || 0,
              profilePicture: row.t2p1_profile_picture || undefined,
              createdAt: new Date(row.t2p1_created_at),
              updatedAt: new Date(row.t2p1_updated_at),
            },
            player2: {
              id: row.t2p2_id,
              name: row.t2p2_name,
              nickname: row.t2p2_nickname || undefined,
              gender: row.t2p2_gender as Gender,
              wins: row.t2p2_wins,
              losses: row.t2p2_losses,
              totalWinnings: row.t2p2_total_winnings || 0,
              profilePicture: row.t2p2_profile_picture || undefined,
              createdAt: new Date(row.t2p2_created_at),
              updatedAt: new Date(row.t2p2_updated_at),
            },
            teamName: row.t2_team_name,
            createdAt: new Date(row.t2_created_at),
          };
        }

        // Build winner (optional)
        let winner: Team | undefined;
        if (row.tw_id) {
          winner = {
            id: row.tw_id,
            tournamentId: row.tw_tournament_id || undefined,
            player1: {
              id: row.twp1_id,
              name: row.twp1_name,
              nickname: row.twp1_nickname || undefined,
              gender: row.twp1_gender as Gender,
              wins: row.twp1_wins,
              losses: row.twp1_losses,
              totalWinnings: row.twp1_total_winnings || 0,
              profilePicture: row.twp1_profile_picture || undefined,
              createdAt: new Date(row.twp1_created_at),
              updatedAt: new Date(row.twp1_updated_at),
            },
            player2: {
              id: row.twp2_id,
              name: row.twp2_name,
              nickname: row.twp2_nickname || undefined,
              gender: row.twp2_gender as Gender,
              wins: row.twp2_wins,
              losses: row.twp2_losses,
              totalWinnings: row.twp2_total_winnings || 0,
              profilePicture: row.twp2_profile_picture || undefined,
              createdAt: new Date(row.twp2_created_at),
              updatedAt: new Date(row.twp2_updated_at),
            },
            teamName: row.tw_team_name,
            createdAt: new Date(row.tw_created_at),
          };
        }

        return {
          id: row.id,
          team1,
          team2,
          score1: row.score1,
          score2: row.score2,
          round: row.round,
          isComplete: row.is_complete === 1,
          winner,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      });
    } catch (error) {
      console.error('Error querying matches:', error);
      throw error;
    }
  }

  // Player Group operations
  async createPlayerGroup(name: string, playerIds: string[]): Promise<PlayerGroup> {
    if (!this.database) throw new Error('Database not initialized');

    const groupId = this.generateId();
    const now = new Date().toISOString();

    try {
      // Create the group
      this.database.runSync(
        'INSERT INTO player_groups (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [groupId, name, now, now]
      );

      // Add members
      for (const playerId of playerIds) {
        const memberId = this.generateId();
        this.database.runSync(
          'INSERT INTO player_group_members (id, group_id, player_id) VALUES (?, ?, ?)',
          [memberId, groupId, playerId]
        );
      }

      // Fetch the created group with players
      const group = await this.getPlayerGroup(groupId);
      if (group) {
        return group;
      } else {
        throw new Error('Failed to fetch created group');
      }
    } catch (error) {
      console.error('Failed to create player group:', error);
      throw error;
    }
  }

  async getAllPlayerGroups(): Promise<PlayerGroup[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const rows = this.database.getAllSync(
        'SELECT * FROM player_groups ORDER BY created_at DESC'
      ) as DatabasePlayerGroup[];

      const groups: PlayerGroup[] = [];
      
      for (const row of rows) {
        const players = await this.getPlayersForGroup(row.id);
        groups.push({
          id: row.id,
          name: row.name,
          players,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });
      }
      
      return groups;
    } catch (error) {
      console.error('Failed to get all player groups:', error);
      throw error;
    }
  }

  async getPlayerGroup(groupId: string): Promise<PlayerGroup | null> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const rows = this.database.getAllSync(
        'SELECT * FROM player_groups WHERE id = ?',
        [groupId]
      ) as DatabasePlayerGroup[];

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const players = await this.getPlayersForGroup(row.id);

      return {
        id: row.id,
        name: row.name,
        players,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      console.error('Failed to get player group:', error);
      throw error;
    }
  }

  async updatePlayerGroup(groupId: string, name: string, playerIds: string[]): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    try {
      // Update group name
      this.database.runSync(
        'UPDATE player_groups SET name = ?, updated_at = ? WHERE id = ?',
        [name, now, groupId]
      );

      // Delete existing members
      this.database.runSync(
        'DELETE FROM player_group_members WHERE group_id = ?',
        [groupId]
      );

      // Add new members
      for (const playerId of playerIds) {
        const memberId = this.generateId();
        this.database.runSync(
          'INSERT INTO player_group_members (id, group_id, player_id) VALUES (?, ?, ?)',
          [memberId, groupId, playerId]
        );
      }
    } catch (error) {
      console.error('Failed to update player group:', error);
      throw error;
    }
  }

  async deletePlayerGroup(groupId: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Delete members first
      this.database.runSync(
        'DELETE FROM player_group_members WHERE group_id = ?',
        [groupId]
      );

      // Delete the group
      this.database.runSync(
        'DELETE FROM player_groups WHERE id = ?',
        [groupId]
      );
    } catch (error) {
      console.error('Failed to delete player group:', error);
      throw error;
    }
  }

  private async getPlayersForGroup(groupId: string): Promise<Player[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const rows = this.database.getAllSync(
        `SELECT p.* FROM players p 
         JOIN player_group_members pgm ON p.id = pgm.player_id 
         WHERE pgm.group_id = ? 
         ORDER BY p.name`,
        [groupId]
      ) as DatabasePlayer[];

      const players = rows.map((row: DatabasePlayer) => ({
        id: row.id,
        name: row.name,
        nickname: row.nickname || undefined,
        gender: row.gender as Gender,
        wins: row.wins,
        losses: row.losses,
        totalWinnings: row.total_winnings || 0,
        profilePicture: row.profile_picture || undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));

      return players;
    } catch (error) {
      console.error('Failed to get players for group:', error);
      throw error;
    }
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.closeAsync();
      this.database = null;
    }
  }
}

export default new DatabaseService(); 