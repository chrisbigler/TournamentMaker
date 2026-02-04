import { Player, Team, Tournament, Match, Gender, TournamentStatus } from '../types';
import DatabaseService from './DatabaseService';

export enum TeamCreationMode {
  MANUAL = 'manual',
  BOY_GIRL = 'boy_girl',
}

class TournamentService {
  // Generate teams from players
  generateTeams(players: Player[], mode: TeamCreationMode): Team[] {
    if (players.length < 2) {
      throw new Error('Need at least 2 players to create teams');
    }

    if (mode === TeamCreationMode.BOY_GIRL) {
      return this.generateBoyGirlTeams(players);
    } else {
      return this.generateManualTeams(players);
    }
  }

  private generateBoyGirlTeams(players: Player[]): Team[] {
    const males = players.filter(p => p.gender === Gender.MALE);
    const females = players.filter(p => p.gender === Gender.FEMALE);

    if (males.length === 0 || females.length === 0) {
      throw new Error('Boy/Girl mode requires at least one male and one female player');
    }

    const teams: Team[] = [];
    const minPairs = Math.min(males.length, females.length);

    // Shuffle arrays for random pairing
    const shuffledMales = this.shuffleArray([...males]);
    const shuffledFemales = this.shuffleArray([...females]);

    // Create boy/girl pairs
    for (let i = 0; i < minPairs; i++) {
      const team: Team = {
        id: this.generateId(),
        player1: shuffledMales[i],
        player2: shuffledFemales[i],
        teamName: `${shuffledMales[i].name} & ${shuffledFemales[i].name}`,
        createdAt: new Date(),
      };
      teams.push(team);
    }

    // Handle remaining players by pairing with each other
    const remainingMales = shuffledMales.slice(minPairs);
    const remainingFemales = shuffledFemales.slice(minPairs);
    const allRemaining = [...remainingMales, ...remainingFemales];

    // Pair remaining players
    for (let i = 0; i < allRemaining.length - 1; i += 2) {
      const team: Team = {
        id: this.generateId(),
        player1: allRemaining[i],
        player2: allRemaining[i + 1],
        teamName: `${allRemaining[i].name} & ${allRemaining[i + 1].name}`,
        createdAt: new Date(),
      };
      teams.push(team);
    }

    return teams;
  }

  private generateManualTeams(players: Player[]): Team[] {
    // For manual mode, we'll just pair players sequentially
    const teams: Team[] = [];
    const shuffledPlayers = this.shuffleArray([...players]);

    // If odd number of players, exclude one for a bye in the bracket
    const playersToTeam = shuffledPlayers.length % 2 === 1 
      ? shuffledPlayers.slice(0, -1) 
      : shuffledPlayers;

    for (let i = 0; i < playersToTeam.length; i += 2) {
      const team: Team = {
        id: this.generateId(),
        player1: playersToTeam[i],
        player2: playersToTeam[i + 1],
        teamName: `${playersToTeam[i].name} & ${playersToTeam[i + 1].name}`,
        createdAt: new Date(),
      };
      teams.push(team);
    }

    // If there was an odd player, create a solo team for them
    if (shuffledPlayers.length % 2 === 1) {
      const lastPlayer = shuffledPlayers[shuffledPlayers.length - 1];
      const team: Team = {
        id: this.generateId(),
        player1: lastPlayer,
        player2: lastPlayer, // Same player as both - this represents a solo team
        teamName: lastPlayer.name,
        createdAt: new Date(),
      };
      teams.push(team);
    }

    return teams;
  }

  // Generate single elimination bracket
  generateBracket(teams: Team[]): Match[] {
    if (teams.length < 2) {
      throw new Error('Need at least 2 teams to create a bracket');
    }

    const shuffledTeams = this.shuffleArray([...teams]);
    
    // Only generate first round matches initially
    // Subsequent rounds will be created as teams advance
    const firstRoundMatches = this.generateFirstRound(shuffledTeams);

    return firstRoundMatches;
  }

  private generateFirstRound(teams: Team[]): Match[] {
    const matches: Match[] = [];
    const teamsToMatch = [...teams];

    // Handle odd number of teams with bye
    if (teamsToMatch.length % 2 === 1) {
      // Give bye to a random team (in a real app, might use seeding)
      const byeTeamIndex = Math.floor(Math.random() * teamsToMatch.length);
      const byeTeam = teamsToMatch.splice(byeTeamIndex, 1)[0];
      
      // Create bye match
      const byeMatch: Match = {
        id: this.generateId(),
        team1: byeTeam,
        team2: undefined, // bye
        score1: 0,
        score2: 0,
        round: 1,
        isComplete: true, // bye matches are automatically complete
        winner: byeTeam,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      matches.push(byeMatch);
    }

    // Create matches for remaining teams
    for (let i = 0; i < teamsToMatch.length; i += 2) {
      const match: Match = {
        id: this.generateId(),
        team1: teamsToMatch[i],
        team2: teamsToMatch[i + 1],
        score1: 0,
        score2: 0,
        round: 1,
        isComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      matches.push(match);
    }

    return matches;
  }

  // Update match score and handle advancement
  async updateMatchScore(
    matchId: string,
    tournamentId: string,
    score1: number,
    score2: number,
    isComplete: boolean = false
  ): Promise<void> {
    // Auto-activate tournament when first score is entered
    const tournament = await DatabaseService.getTournament(tournamentId);
    if (tournament && tournament.status === TournamentStatus.SETUP) {
      await this.activateTournament(tournamentId);
    }

    if (isComplete && score1 !== score2) {
      // Get the match to determine the winner team ID
      const match = tournament?.matches.find(m => m.id === matchId);
      
      if (match) {
        const winnerTeamId = score1 > score2 ? match.team1.id : match.team2?.id;
        
        await DatabaseService.updateMatch(matchId, {
          score1,
          score2,
          isComplete: true,
          winnerId: winnerTeamId
        });

        // Update player statistics
        await this.updatePlayerStatsForMatch(match, score1, score2);

        // Check if round is complete and create next round if needed
        await this.checkAndCreateNextRound(tournamentId);
      }
    } else {
      // Just update scores without completion
      await DatabaseService.updateMatch(matchId, {
        score1,
        score2,
        isComplete: false
      });
    }
  }

  // Update player statistics when a match is completed
  private async updatePlayerStatsForMatch(match: Match, score1: number, score2: number): Promise<void> {
    try {
      // Skip bye matches (no team2)
      if (!match.team2) {
        return;
      }

      // Determine winner and loser teams
      const isTeam1Winner = score1 > score2;
      const winnerTeam = isTeam1Winner ? match.team1 : match.team2;
      const loserTeam = isTeam1Winner ? match.team2 : match.team1;

      // Update winner team players (add 1 win to each)
      const winnerPlayer1 = winnerTeam.player1;
      const winnerPlayer2 = winnerTeam.player2;
      
      await DatabaseService.updatePlayerStats(
        winnerPlayer1.id, 
        winnerPlayer1.wins + 1, 
        winnerPlayer1.losses
      );
      await DatabaseService.updatePlayerStats(
        winnerPlayer2.id, 
        winnerPlayer2.wins + 1, 
        winnerPlayer2.losses
      );

      // Update loser team players (add 1 loss to each)
      const loserPlayer1 = loserTeam.player1;
      const loserPlayer2 = loserTeam.player2;
      
      await DatabaseService.updatePlayerStats(
        loserPlayer1.id, 
        loserPlayer1.wins, 
        loserPlayer1.losses + 1
      );
      await DatabaseService.updatePlayerStats(
        loserPlayer2.id, 
        loserPlayer2.wins, 
        loserPlayer2.losses + 1
      );
    } catch (error) {
      console.error('Failed to update player statistics:', error);
      // Don't throw error to avoid breaking tournament flow
    }
  }

  // Check if current round is complete and create next round matches
  private async checkAndCreateNextRound(tournamentId: string): Promise<void> {
    const tournament = await DatabaseService.getTournament(tournamentId);
    if (!tournament) return;

    const currentRound = tournament.currentRound;
    const currentRoundMatches = tournament.matches.filter(m => m.round === currentRound);
    
    // Check if all matches in current round are complete
    const allComplete = currentRoundMatches.every(m => m.isComplete);
    
    if (allComplete && currentRoundMatches.length > 1) {
      // Get winners from current round
      const winners = currentRoundMatches
        .filter(m => m.winner)
        .map(m => m.winner!)
        .filter(Boolean);

      if (winners.length > 1) {
        // Create next round matches
        const nextRound = currentRound + 1;
        const nextRoundMatches = this.generateRoundMatches(winners, nextRound, currentRoundMatches);

        // Save new matches to database
        for (const match of nextRoundMatches) {
          await DatabaseService.createMatch(match, tournamentId);
        }

        // Update tournament current round
        await DatabaseService.updateTournament(tournamentId, {
          currentRound: nextRound
        });
      } else if (winners.length === 1) {
        // Tournament is complete - we have a winner
        await this.completeTournament(tournamentId, winners[0]);
      }
    } else if (allComplete && currentRoundMatches.length === 1) {
      // Single match in final round is complete - tournament is finished
      const finalMatch = currentRoundMatches[0];
      if (finalMatch.winner) {
        await this.completeTournament(tournamentId, finalMatch.winner);
      }
    }
  }

  // Complete tournament (mark as COMPLETED and set winner)
  async completeTournament(tournamentId: string, winner: Team): Promise<void> {
    try {
      await DatabaseService.updateTournament(tournamentId, {
        status: TournamentStatus.COMPLETED,
        winnerId: winner.id
      });
    } catch (error) {
      console.error('Failed to complete tournament:', error);
      throw error;
    }
  }

  // Generate matches for a specific round with given teams
  private generateRoundMatches(teams: Team[], round: number, previousRoundMatches?: Match[]): Match[] {
    const matches: Match[] = [];
    let teamsToMatch = [...teams];

    // Handle odd number of teams with bye
    if (teamsToMatch.length % 2 === 1) {
      let byeTeam: Team;
      
      if (previousRoundMatches && previousRoundMatches.length > 0) {
        // Find the team with the biggest score differential from previous round
        let biggestDifferential = -1;
        let teamWithBiggestDifferential: Team | null = null;
        
        previousRoundMatches.forEach(match => {
          if (match.winner && match.team2) { // Skip bye matches
            const differential = Math.abs(match.score1 - match.score2);
            
            if (differential > biggestDifferential) {
              biggestDifferential = differential;
              teamWithBiggestDifferential = match.winner;
            }
          }
        });
        
        if (teamWithBiggestDifferential && teamsToMatch.some(team => team.id === teamWithBiggestDifferential!.id)) {
          byeTeam = teamWithBiggestDifferential;
          teamsToMatch = teamsToMatch.filter(team => team.id !== byeTeam.id);
        } else {
          // Fallback to random if team not found
          byeTeam = teamsToMatch.pop()!;
        }
      } else {
        // For first round or when no previous round data, assign randomly
        byeTeam = teamsToMatch.pop()!;
      }
      
      // Create bye match
      const byeMatch: Match = {
        id: this.generateId(),
        team1: byeTeam,
        team2: undefined,
        score1: 0,
        score2: 0,
        round,
        isComplete: true,
        winner: byeTeam,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      matches.push(byeMatch);
    } else {
      // Even number of teams, just shuffle for random matchups
      teamsToMatch = this.shuffleArray(teamsToMatch);
    }

    // Create matches for remaining teams
    for (let i = 0; i < teamsToMatch.length; i += 2) {
      if (i + 1 < teamsToMatch.length) {
        const match: Match = {
          id: this.generateId(),
          team1: teamsToMatch[i],
          team2: teamsToMatch[i + 1],
          score1: 0,
          score2: 0,
          round,
          isComplete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        matches.push(match);
      }
    }

    return matches;
  }

  // Create a new tournament
  async createTournament(
    name: string,
    players: Player[],
    teamMode: TeamCreationMode,
    buyIn: number
  ): Promise<string> {
    try {
      // Generate teams
      const teams = this.generateTeams(players, teamMode);
      
      // Generate bracket
      const matches = this.generateBracket(teams);

      // Create tournament in database
      const pot = players.length * buyIn;
      const tournamentId = await DatabaseService.createTournament({
        name,
        status: TournamentStatus.SETUP,
        currentRound: 1,
        buyIn,
        pot,
        winner: undefined,
      });

      // Save teams to database
      for (const team of teams) {
        await DatabaseService.createTeam(team, tournamentId);
      }

      // Save matches to database
      for (const match of matches) {
        await DatabaseService.createMatch(match, tournamentId);
      }

      return tournamentId;
    } catch (error) {
      console.error('Failed to create tournament:', error);
      throw error;
    }
  }

  // Activate tournament (transition from SETUP to ACTIVE)
  async activateTournament(tournamentId: string): Promise<void> {
    try {
      const tournament = await DatabaseService.getTournament(tournamentId);
      if (tournament && tournament.status === TournamentStatus.SETUP) {
        await DatabaseService.updateTournament(tournamentId, {
          status: TournamentStatus.ACTIVE
        });
      }
    } catch (error) {
      console.error('Failed to activate tournament:', error);
      throw error;
    }
  }

  // Fix tournament that has teams but no matches (regenerate bracket)
  async fixTournamentBracket(tournamentId: string): Promise<void> {
    try {
      const tournament = await DatabaseService.getTournament(tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // If tournament has teams but no matches, regenerate the bracket
      if (tournament.teams.length >= 2 && tournament.matches.length === 0) {
        // Generate bracket from existing teams
        const matches = this.generateBracket(tournament.teams);

        // Save matches to database
        for (const match of matches) {
          await DatabaseService.createMatch(match, tournamentId);
        }
      }
    } catch (error) {
      console.error('Failed to fix tournament bracket:', error);
      throw error;
    }
  }

  // Reset all player statistics to 0-0
  async resetPlayerStatistics(): Promise<void> {
    try {
      // Get all players and reset their stats to 0
      const players = await DatabaseService.getAllPlayers();

      // Reset all player stats to 0
      for (const player of players) {
        await DatabaseService.updatePlayerStats(player.id, 0, 0);
      }
    } catch (error) {
      console.error('Failed to reset player statistics:', error);
      throw error;
    }
  }

  // Fix player statistics by recalculating from all completed matches
  async fixPlayerStatistics(): Promise<void> {
    try {
      // Get all players once and build a Map for O(1) lookups
      const players = await DatabaseService.getAllPlayers();
      const playerStatsMap = new Map<string, { wins: number; losses: number }>();
      
      // Initialize all players with 0-0 stats
      for (const player of players) {
        playerStatsMap.set(player.id, { wins: 0, losses: 0 });
      }

      // Get all tournaments
      const tournaments = await DatabaseService.getAllTournaments();

      // Process each tournament's completed matches
      for (const tournament of tournaments) {
        // Get all completed matches for this tournament (skip bye matches)
        const completedMatches = tournament.matches.filter(match => 
          match.isComplete && match.team2
        );

        // Update stats in memory for each completed match
        for (const match of completedMatches) {
          const isTeam1Winner = match.score1 > match.score2;
          const winnerTeam = isTeam1Winner ? match.team1 : match.team2!;
          const loserTeam = isTeam1Winner ? match.team2! : match.team1;

          // Increment wins for winner team players
          const winner1Stats = playerStatsMap.get(winnerTeam.player1.id);
          const winner2Stats = playerStatsMap.get(winnerTeam.player2.id);
          if (winner1Stats) winner1Stats.wins++;
          if (winner2Stats) winner2Stats.wins++;

          // Increment losses for loser team players
          const loser1Stats = playerStatsMap.get(loserTeam.player1.id);
          const loser2Stats = playerStatsMap.get(loserTeam.player2.id);
          if (loser1Stats) loser1Stats.losses++;
          if (loser2Stats) loser2Stats.losses++;
        }
      }

      // Batch update all player stats to database
      for (const [playerId, stats] of playerStatsMap) {
        await DatabaseService.updatePlayerStats(playerId, stats.wins, stats.losses);
      }
    } catch (error) {
      console.error('Failed to fix player statistics:', error);
      throw error;
    }
  }

  // Utility methods
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Get tournament bracket structure for display
  getBracketStructure(matches: Match[]): { [round: number]: Match[] } {
    const bracket: { [round: number]: Match[] } = {};
    
    matches.forEach(match => {
      if (!bracket[match.round]) {
        bracket[match.round] = [];
      }
      bracket[match.round].push(match);
    });

    return bracket;
  }

  // Check if tournament is complete
  isTournamentComplete(matches: Match[]): boolean {
    const finalRound = Math.max(...matches.map(m => m.round));
    const finalMatches = matches.filter(m => m.round === finalRound);
    return finalMatches.every(m => m.isComplete);
  }

  // Get tournament winner
  getTournamentWinner(matches: Match[]): Team | null {
    if (!this.isTournamentComplete(matches)) return null;

    const finalRound = Math.max(...matches.map(m => m.round));
    const finalMatch = matches.find(m => m.round === finalRound && m.isComplete);

    return finalMatch?.winner || null;
  }

  // Get tournament runner up (loser of final match)
  getTournamentRunnerUp(matches: Match[]): Team | null {
    if (!this.isTournamentComplete(matches)) return null;

    const finalRound = Math.max(...matches.map(m => m.round));
    const finalMatch = matches.find(m => m.round === finalRound && m.isComplete);

    if (!finalMatch || !finalMatch.team2) return null;

    return finalMatch.winner?.id === finalMatch.team1.id ? finalMatch.team2 : finalMatch.team1;
  }

  // Check if a given round is the championship round (final round with 2 teams)
  isChampionshipRound(matches: Match[], round: number): boolean {
    if (!matches || matches.length === 0) return false;
    
    // Get matches for the specified round
    const roundMatches = matches.filter(m => m.round === round);
    
    // Championship round has exactly one match (2 teams)
    // Filter out bye matches (where team2 is undefined)
    const nonByeMatches = roundMatches.filter(m => m.team2 !== undefined);
    
    return nonByeMatches.length === 1;
  }

  // Get display text for round (either "Round X" or "Championship Round")
  getRoundDisplayText(matches: Match[], round: number): string {
    return this.isChampionshipRound(matches, round) ? 'Championship Round' : `Round ${round}`;
  }
}

export default new TournamentService(); 