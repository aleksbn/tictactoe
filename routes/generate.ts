import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import _ from "lodash";
import { checkForWinner, pcMove } from "../helpers/game-helper";
import { names } from "../helpers/random-helpers";
import { UserModel } from "../models/mongoose/userModel";
import { GameModel } from "../models/mongoose/gameModel";
const router = express.Router();

router.get("/:players/:games", async (req: Request, res: Response) => {
  const numOfPlayers = +req.params.players;

  //Generating player names
  const playerNames: string[] = [];
  for (let i = 0; i < numOfPlayers; i++) {
    let generatedName = names[Math.trunc(Math.random() * names.length)];
    let counter = 0;
    while (true) {
      if (playerNames.some((pn) => pn === generatedName)) {
        generatedName += counter;
        counter++;
      } else {
        playerNames.push(generatedName);
        break;
      }
    }
  }

  // Generating user accounts
  for (let i = 0; i < playerNames.length; i++) {
    const salt = await bcrypt.genSalt(10);
    const newUser = await UserModel.create({
      email: `${playerNames[i]}@test.net`,
      password: await bcrypt.hash(`${playerNames[i]}sifra`, salt),
      nickname: playerNames[i],
    });
    await newUser.save();
  }

  // Generating games
  const numOfGames = +req.params.games;
  const allUsers = await UserModel.find();
  for (const user of allUsers) {
    for (let i = 0; i < numOfGames; i++) {
      const newGame = await GameModel.create({
        creatorId: user._id,
        isAgainstPC: Math.floor(Math.random() * 2) === 0 ? false : true,
      });
      if (!newGame.isAgainstPC) {
        newGame.opponentId = allUsers
          .filter((el) => el._id.toString() !== newGame.creatorId)
          [Math.floor(Math.random() * (allUsers.length - 1))]._id.toString();
      } else {
        newGame.opponentId = "PC";
      }
      await newGame.save();
    }
  }

  // Generating moves
  const allGames = await GameModel.find();
  for (const game of allGames) {
    if (!game.winnerId && game.moves.length === 0) {
      let nextMove = !!Math.floor(Math.random() * 2); // true if player 1 plays first
      while (!game.winnerId) {
        let nextPlayer: string = nextMove ? game.creatorId : game.opponentId!;
        game.moves.push(
          pcMove((await GameModel.findById(game.id).lean())!, nextPlayer)
        );
        await game.save();
        let result = await checkForWinner(
          (await GameModel.findById(game.id).lean())!
        );
        if (result.winnerId) {
          game.winnerId = result.winnerId;
          await game.save();
        }
        nextMove = !nextMove;
      }
    }
  }

  res.status(200).send("Everything is generated");
});

export default router;
