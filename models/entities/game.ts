import { Move } from "./move";

interface IGame {
  creatorId: string;
  isAgainstPC: boolean;
  opponentId?: string | null;
  winnerId?: string | null;
  moves?: Move[] | null;
}

class Game implements IGame {
  creatorId: string;
  isAgainstPC: boolean;
  opponentId?: string | null;
  winnerId?: string | null;
  moves?: Move[] | null;

  constructor(creatorId: string, isAgainstPC: boolean) {
    this.creatorId = creatorId;
    this.isAgainstPC = isAgainstPC;
  }
}

export { Game, IGame };
