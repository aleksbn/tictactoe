import { Move } from "../entities/move";
import UserDTO from "./userDTO";

interface IHistoryItemDTO {
  gameId: string;
  player1: UserDTO;
  player2: UserDTO;
  winner: string;
  moves: Move[];
}

class HistoryItemDTO implements IHistoryItemDTO {
  gameId: string;
  player1: UserDTO;
  player2: UserDTO;
  winner: string;
  moves: Move[];

  constructor(
    gameId: string,
    player1: UserDTO,
    player2: UserDTO,
    winner: string,
    moves: Move[]
  ) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    this.winner = winner;
    this.moves = moves;
  }
}

export default HistoryItemDTO;
