interface IGameResultDTO {
  winnerId?: string;
  statusText: string;
  status: number;
}

class GameResultDTO implements IGameResultDTO {
  winnerId?: string | undefined;
  statusText: string;
  status: number;

  constructor(statusText: string, status: number) {
    this.statusText = statusText;
    this.status = status;
  }
}

export { GameResultDTO };
