import Joi from "joi";
import mongoose from "mongoose";
import { Game } from "../entities/game";
import { MoveSchema } from "./moveModel";

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
		type: [MoveSchema],
		default: [],
	},
});

const GameModel = mongoose.model("Game", gameSchema);

function validateGame(game: Game) {
	const schema = Joi.object({
		creatorId: Joi.string().required(),
		isAgainstPC: Joi.boolean(),
	});
	return schema.validate(game);
}

export { GameModel, validateGame as validate };
