interface IMove {
  playerId: string;
  xCoord: number;
  yCoord: number;
}

class Move implements IMove {
  playerId: string;
  xCoord: number;
  yCoord: number;

  constructor(playerId: string, xCoord: number, yCoord: number) {
    this.playerId = playerId;
    this.xCoord = xCoord;
    this.yCoord = yCoord;
  }
}

export { Move, IMove };
