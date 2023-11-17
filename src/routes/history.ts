import { GameModel } from '../models/game';
import auth from '../middleware/auth';
import express from 'express';
import HistoryItem from '../models/historyItem';
import UserDTO from '../models/DTOs/user-dto';
import { UserModel } from '../models/user';
import { createSingleGameHistory } from '../helpers/game-helper';

const router = express.Router();

//Pregled pojedinacne istorije igre
router.get('/:id', auth, async (req: any, res) => {
  let game: any;
  try {
    game = await GameModel.findById(req.params.id);
  } catch (ex) {
    return res
      .status(404)
      .send('That game does not exist. Try creating one instead!');
  }

  //Ako igra jos nije gotova
  if (game.winnerId === undefined) {
    return res
      .status(403)
      .send(
        'That game is not complete yet. You cannot view its history until someone wins.'
      );
  }

  //Ako igrac nije dio igre
  if (game.creatorId !== req.user._id && game.opponentId !== req.user._id) {
    return res
      .status(403)
      .send(
        'You were not a part of this game, and therefore you cannot view its history.'
      );
  }

  //Generisanje jedne istorije igranja
  const historyItem = await createSingleGameHistory(game);

  res.status(200).send(historyItem);
});

//Pregled istorije svih igara za odredjenog korisnika
router.get('/', auth, async (req: any, res) => {
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

    const historyArray = await Promise.all(games.map(
      async (game) =>
        (await createSingleGameHistory(game))
    ));
    res.status(200).send(historyArray);
  } catch (ex) {
    res.status(404).send("You don't have any games played.");
  }
});

export default router;
