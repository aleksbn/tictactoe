import Joi from 'joi';
import mongoose from 'mongoose';

interface IMove {
  playerId: string,
  xCoord: number,
  yCoord: number
}

interface IGame {
  creatorId: string,
  isAgainstPC: boolean,
  opponentId?: string,
  winnerId?: string,
  moves?: Move[]
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

class Game implements IGame {
  creatorId: string;
  isAgainstPC: boolean;
  opponentId?: string | undefined;
  winnerId?: string | undefined;
  moves?: Move[] | undefined;
  
  constructor(creatorId: string, isAgainstPC: boolean) {
    this.creatorId = creatorId;
    this.isAgainstPC = isAgainstPC;
  }
}

const moveSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
  },
  xCoord: {
    type: Number,
    min: 0,
    max: 2,
  },
  yCoord: {
    type: Number,
    min: 0,
    max: 2,
  },
});

const gameSchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
  isAgainstPC: {
    type: Boolean,
    default: false,
  },
  opponentId: {
    type: String,
  },
  winnerId: {
    type: String,
  },
  moves: {
    type: [moveSchema],
    default: [],
  },
});

const GameModel = mongoose.model('Game', gameSchema);

function validateGame(game: Game) {
  const schema = Joi.object({
    creatorId: Joi.string().required(),
    isAgainstPC: Joi.boolean(),
  });
  console.log(schema.validate(game));
  return schema.validate(game);
}

export { GameModel, Game, Move, validateGame as validate };