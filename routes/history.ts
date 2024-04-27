import { IGame } from "../models/entities/game";
import auth from "../middleware/auth";
import express, { Response } from "express";
import { createOneGameHistory } from "../helpers/game-helper";
import { GameModel } from "../models/mongoose/gameModel";
import { userDataLogger } from "../helpers/user-data-logger";

const router = express.Router();

interface IFullGame extends IGame {
	_id: string;
}

//Pregled pojedinacne istorije igre
router.get("/:id", auth, async (req: any, res: Response) => {
	let game: IFullGame | null;
	try {
		game = await GameModel.findById(req.params.id).lean();
	} catch (ex: any) {
		userDataLogger.log("warn", ex.message);
		return res
			.status(404)
			.send("That game does not exist. Try creating one instead!");
	}

	if (!game) {
		return;
	}

	//Ako igra jos nije gotova
	if (!game.winnerId) {
		return res
			.status(403)
			.send(
				"That game is not complete yet. You cannot view its history until someone wins."
			);
	}

	//Ako igrac nije dio igre
	if (game.creatorId !== req.user._id && game.opponentId !== req.user._id) {
		return res
			.status(403)
			.send(
				"You were not a part of this game, and therefore you cannot view its history."
			);
	}

	//Generisanje jedne istorije igranja
	const historyItem = await createOneGameHistory(game);

	res.status(200).send(historyItem);
});

//Pregled istorije svih igara za odredjenog korisnika
router.get("/", auth, async (req: any, res) => {
	try {
		const games = await GameModel.find({
			$and: [
				{
					$or: [{ creatorId: req.user._id }, { opponentId: req.user._id }],
				},
				{
					winnerId: { $exists: true },
				},
			],
		});

		const historyArray = await Promise.all(
			games
				.filter((g) => g.toObject().winnerId)
				.map(async (game) => await createOneGameHistory(game.toObject()))
		);
		res.status(200).send(historyArray);
	} catch (ex) {
		res.status(404).send("You don't have any games played.");
	}
});

export default router;
