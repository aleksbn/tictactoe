const Joi = require('joi');
const mongoose = require('mongoose');

const moveSchema = new mongoose.Schema({
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
    default: undefined,
  },
});

const Game = mongoose.model('Game', gameSchema);

function validateGame(game) {
  const schema = Joi.object({
    creatorId: Joi.string().required(),
    isAgainstPC: Joi.boolean(),
  });
  console.log(schema.validate(game));
  return schema.validate(game);
}

exports.Game = Game;
exports.validate = validateGame;
