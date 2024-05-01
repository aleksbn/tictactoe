import auth from "../middleware/auth";
import validateObjectId from "../middleware/validateObjectId";
import _ from "lodash";
import { Game } from "../models/entities/game";
import { Move } from "../models/entities/move";
import express, { Request, Response } from "express";
import { checkForWinner, pcMove } from "../helpers/game-helper";
import { Model } from "mongoose";
import { validate as validateGame } from "../models/mongoose/gameModel";
import { GameModel } from "../models/mongoose/gameModel";
import { userDataLogger } from "../helpers/user-data-logger";
const router = express.Router();

router.post("/create/", auth, async (req: any, res: Response) => {
	const { error } = validateGame(new Game(req.user._id!, req.body.isAgainstPC));
	if (error) {
		userDataLogger.warning(error.details[0].message);
		return res.status(400).send(error.details[0].message);
	}

	let game = new GameModel({
		creatorId: req.user._id,
		isAgainstPC: req.body.isAgainstPC,
	});
	if (game.isAgainstPC) game.opponentId = "PC";
	await game.save();

	res.send(game._id);
});

router.get(
	"/:id",
	[validateObjectId, auth],
	async (req: Request, res: Response) => {
		let game: Model<Game> | null;
		try {
			game = await GameModel.findOne({ _id: req.params.id });
		} catch (error: any) {
			userDataLogger.warning(error.message);
			return res.status(404).send("Something went wrong in getting game data.");
		}

		res.status(200).send(game);
	}
);

// Igri se mozemo pridruziti u sljedecim slucajevima:
// 1. Ako smo kreirali igru
// 2. Ako je slobodno mjesto drugog igraca, a igra nije oznacena kao single player
router.get(
	"/join/:id",
	[validateObjectId, auth],
	async (req: any, res: Response) => {
		// Pronalazimo igru na osnovu ID-ja iz params
		let game: Game | null;
		try {
			game = await GameModel.findById(req.params.id).lean();
		} catch (ex: any) {
			userDataLogger.warning(ex.message);
			return res
				.status(404)
				.send("That game does not exist. Try creating one instead!");
		}

		if (!game) {
			return;
		}

		// Ako je igra vec zavrsena od ranije i ima pobjednika
		if (game.winnerId) {
			return res
				.status(401)
				.send(
					"That game has already been played. Try creating or joining another one!"
				);
		}

		// Ako je igra protiv PC-ja, a nije kreirana od strane tog korisnika koji se join-uje
		if (game.isAgainstPC && game.creatorId !== req.user._id)
			return res
				.status(403)
				.send(
					"This game has been marked as played against PC. You cannot join it."
				);

		// Ako igru nije kreirao korisnik, a neko drugi se vec prijavio kao protivnik
		if (
			game.creatorId !== req.user._id &&
			game.opponentId !== undefined &&
			game.opponentId !== req.user._id
		)
			return res
				.status(403)
				.send("That game already has two players. Try joining another one!");

		// U suprotnom se mozemo prijaviti
		if (game.creatorId !== req.user._id) {
			game.opponentId = req.user._id;
			try {
				await GameModel.updateOne(
					{ _id: req.params.id },
					{ opponentId: req.user._id }
				);
			} catch (error: any) {
				// Ako dodje do greske kod update-a
				userDataLogger.warning(error.message);
				return res.status(500).send("Failed to update game data.");
			}
		}

		return res.status(200).send(game);
	}
);

router.post(
	"/makeamove/:id",
	[validateObjectId, auth],
	async (req: any, res: Response) => {
		// Pronalazimo igru na osnovu ID-ja iz params
		let game: Game | null;
		try {
			game = await GameModel.findById(req.params.id).lean();
		} catch (ex: any) {
			userDataLogger.warning(ex.message);
			return res
				.status(404)
				.send("That game does not exist. Try creating one instead!");
		}

		if (!game) {
			return;
		}

		// Ako igrac nije dio igre
		if (game.creatorId !== req.user._id && game.opponentId !== req.user._id)
			return res.status(403).send("You're not a part of this game.");

		// Ako igra nema oba igraca
		if (!game.opponentId)
			return res.status(403).send("Game does not have both players yet.");

		// Ukoliko je igra vec gotova i ima pobjednika
		if (game.winnerId)
			return res.status(401).send("This game has already been finished.");

		const move: Move = req.body;
		if (!game.moves) game.moves = [];

		// Ako nije taj korisnik na redu (prvo igranje ne racunamo)
		if (
			game.moves.length !== 0 &&
			game.moves[game.moves.length - 1].playerId === req.user._id &&
			move.playerId !== "PC"
		)
			return res
				.status(405)
				.send("It's not your turn! Wait for the other player to make a move.");

		// Ako je taj potez ranije odigran, prekini izvrsavanje
		if (
			game.moves.some((moveFromDb: Move) => {
				return (
					moveFromDb.xCoord === +move.xCoord &&
					moveFromDb.yCoord === +move.yCoord
				);
			})
		)
			return res
				.status(400)
				.send("That move has already been played. Choose another one.");

		// Ako je sve u redu, provjeri da li je potez za PC-ja. Ako jeste, generisi potez. Ako nije, dodaj potez u igru
		if (move.playerId === "PC") {
			setTimeout(async () => {
				game!.moves!.push(pcMove(game!, "PC"));
				// Provjeri da li je korisnik pobijedio
				let result = await checkForWinner(game!);

				// Sacuvaj promjene u bazi i vrati rezultat na front
				try {
					await GameModel.updateOne(
						{ _id: req.params.id },
						{
							moves: game!.moves!,
							winnerId: game!.winnerId ? game!.winnerId : "",
						}
					);
				} catch (error: any) {
					// Ako dodje do greske kod update-a
					userDataLogger.warning(error.message);
					return res.status(500).send("Failed to update game data.");
				}
				return res.status(result.status).send(game);
			}, 1000);
		} else {
			game.moves.push(move);

			// Provjeri da li je korisnik pobijedio
			let result = await checkForWinner(game);

			// Sacuvaj promjene u bazi i vrati rezultat na front
			try {
				await GameModel.updateOne(
					{ _id: req.params.id },
					{ moves: game.moves!, winnerId: game.winnerId ? game.winnerId : "" }
				);
			} catch (error: any) {
				// Ako dodje do greske kod update-a
				userDataLogger.warning(error.message);
				return res.status(500).send("Failed to update game data.");
			}
			return res.status(result.status).send(game);
		}
	}
);

export default router;
