import TournamentService, { TeamCreationMode } from '../src/services/TournamentService';
import { Player, Team, Match, Gender } from '../src/types';

function createPlayer(id: string, name: string, gender: Gender): Player {
  const now = new Date();
  return { id, name, gender, wins: 0, losses: 0, createdAt: now, updatedAt: now };
}

describe('TournamentService', () => {
  test('generateTeams manual mode with odd players creates solo team', () => {
    const players: Player[] = [
      createPlayer('1', 'Alice', Gender.FEMALE),
      createPlayer('2', 'Bob', Gender.MALE),
      createPlayer('3', 'Carol', Gender.FEMALE),
    ];

    const teams = TournamentService.generateTeams(players, TeamCreationMode.MANUAL);
    expect(teams).toHaveLength(2);
  });

  test('getRoundDisplayText returns Championship Round when final round', () => {
    const now = new Date();
    const team: Team = {
      id: 't1',
      player1: createPlayer('1', 'Alice', Gender.FEMALE),
      player2: createPlayer('2', 'Bob', Gender.MALE),
      teamName: 'Test Team',
      createdAt: now,
    };

    const matches: Match[] = [
      { id: 'm1', team1: team, team2: team, score1: 1, score2: 0, round: 2, isComplete: true, winner: team, createdAt: now, updatedAt: now },
    ];

    const text = TournamentService.getRoundDisplayText(matches, 2);
    expect(text).toBe('Championship Round');
  });
});
