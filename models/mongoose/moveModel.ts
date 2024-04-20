import mongoose from "mongoose";

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

export { moveSchema as MoveSchema };
