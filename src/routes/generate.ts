import express from 'express';
import _ from 'lodash';
import { checkForWinner, pcMove } from '../helpers/game-helper';
import { GameModel } from '../models/game';
import { UserModel } from '../models/user';
const router = express.Router();

router.get('/games/:number', async (req, res) => {
  const numOfObjects = +req.params.number;
  const allUsers = await UserModel.find();
  for(const user of allUsers) {
    for (let i = 0; i < numOfObjects; i++) {
      const newGame = await GameModel.create({
        creatorId: user._id,
        isAgainstPC: Math.floor(Math.random() * 2) === 0 ? false : true,
      });
      if (!newGame.isAgainstPC) {
        newGame.opponentId = 
        allUsers.filter((el) => el._id.toString() !== newGame.creatorId)[
          Math.floor(Math.random() * (allUsers.length - 1))
        ]._id.toString();
      }
      await newGame.save();
    }
  };
  const games = await GameModel.find();
  console.log(games);
  res.send(games);
});

router.get('/moves', async(req, res) => {
  const allGames = await GameModel.find();
  for(const game of allGames) {
    if(game.winnerId !== undefined && game.moves.length === 0) {
      game.opponentId = game.isAgainstPC ? 'PC' : game.opponentId;
      let firstMove = !!(Math.floor(Math.random() * 2)); // true if player 1 plays first
      while(!game.winnerId) {
        let nextPlayer: any = firstMove ? game.creatorId : game.opponentId;
        game.moves.push(pcMove(game, nextPlayer));
        await checkForWinner(game);
        await game.save();
        firstMove = !firstMove;
      }
    }
  }
  res.status(200).send('Games are populated with results.');
})

export default router;
