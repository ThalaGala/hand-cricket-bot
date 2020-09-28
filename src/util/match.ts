import { User, TextChannel, MessageEmbed } from 'discord.js';
import toss from './toss';
import DiscordClient from './DiscordClient';

export enum Players { CHALLENGER, OPPONENT };
export enum MatchResult { TIE, CHALLENGER_WON, OPPONENT_WON };
export enum RoundResult { BATSMAN_SCORED, BATSMAN_OUT };

export class Match {
  challenger: User;
  opponent: User;
  stadium: TextChannel;
  client: DiscordClient;

  opener: Players;
  currentBatsman: Players;
  result: MatchResult;
  ballsPlayed: [number, number] = [0, 0];
  numInnings: number = 0;

  challengerScore: number = 0;
  opponentScore: number = 0;

  toss = toss;

  constructor(client: DiscordClient, stadium: TextChannel, challenger: User) {
    this.client = client;
    this.challenger = challenger;
    this.stadium = stadium;
  }

  getScoreBoard() {
    const scoreboard = new MessageEmbed()
    .setAuthor('Hand Cricketer', this.client.user.avatarURL())
    .setTitle('Scoreboard')
    .setTimestamp()
    .setFooter('Stats generated by Hand Cricketer', this.client.user.avatarURL())
    .addField(`Opener`, `<@${ this.opener === Players.OPPONENT ? this.opponent.id : this.challenger.id }>`, true)
    .addField(`Chaser`, `<@${ this.opener === Players.CHALLENGER ? this.opponent.id : this.challenger.id }>`, true)
    .addField(`Balls played in first innings`, this.ballsPlayed[0], true)
    .setDescription(this.numInnings === 1 ? `Mid Innings Score` : `Match End Score`)

    if (this.numInnings > 1) scoreboard.addField('Balls played in second innings', this.ballsPlayed[1], true);

    scoreboard.addField(`Opener's score`, this.opener === Players.CHALLENGER ? this.challengerScore : this.opponentScore, true);
    if (this.numInnings > 1) scoreboard.addField(`Chaser's score`, this.opener === Players.OPPONENT ? this.challengerScore : this.opponentScore, true);

    switch (this.result) {
      case MatchResult.TIE:
        scoreboard.addField('Result', 'It was a tie :(');
        break;
      case MatchResult.OPPONENT_WON:
        scoreboard.addField('Result', `<@${this.opponent.id}> won! :trophy:`);
        break;
      case MatchResult.CHALLENGER_WON:
        scoreboard.addField('Result', `<@${this.challenger.id}> won! :trophy:`);
    }

    return scoreboard;
  }

  inningsOver(result: RoundResult) { // Can be overridden

  }

  /**
   *
   * @param batsman Which player is the batsman
   * @param batsmanPlayed Number of fingers
   * @param bowlerPlayed Number of fingers
   */
  calculateRoundResult(batsmanPlayed: number, bowlerPlayed: number) {
    if (batsmanPlayed === bowlerPlayed) this.inningsOver(RoundResult.BATSMAN_OUT);
    else {
      this.currentBatsman === Players.CHALLENGER ? this.challengerScore += batsmanPlayed : this.opponentScore += batsmanPlayed;
      this.inningsOver(RoundResult.BATSMAN_SCORED);
    }
  }

  comment(commentry: string) {
    this.stadium.send(`**Commentator**: ${commentry}`);
  }
}
