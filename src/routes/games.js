const auth = require('../middleware/auth');
const _ = require('lodash');
const { Game, validate } = require('../models/game');
const express = require('express');
// const { model } = require('mongoose');
const router = express.Router();
const { checkForWinner, pcMove } = require('../helpers/game-helper');

router.post('/create/', auth, async (req, res) => {
  const { error } = validate({
    creatorId: req.user._id,
    isAgainstPC: req.body.isAgainstPC,
  });
  if (error) return res.status(400).send(error.details[0].message);

  let game = new Game({
    creatorId: req.user._id,
    isAgainstPC: req.body.isAgainstPC,
  });
  await game.save();

  res.send(game._id);
});

// Igri se mozemo pridruziti u sljedecim slucajevima:
// 1. Ako smo kreirali igru
// 2. Ako je slobodno mjesto drugog igraca, a igra nije oznacena kao single player
router.get('/join/:id', auth, async (req, res) => {
  // Pronalazimo igru na osnovu ID-ja iz params
  let game = undefined;
  try {
    game = await Game.findById(req.params.id);
  } catch (ex) {
    return res
      .status(404)
      .send('That game does not exist. Try creating one instead!');
  }

  // Ako je igra vec zavrsena od ranije i ima pobjednika
  if (game.winnerId !== undefined)
    return res
      .status(403)
      .send(
        'That game has already been played. Try creating or joining another one!'
      );

  // Ako je igra protiv PC-ja, a nije kreirana od strane tog korisnika koji se join-uje
  if (game.isAgainstPC && game.creatorId !== req.user._id)
    return res
      .status(403)
      .send(
        'This game has been marked as played against PC. You cannot join it.'
      );

  // Ako igru nije kreirao korisnik, a neko drugi se vec prijavio kao protivnik
  if (
    game.creatorId !== req.user._id &&
    game.opponentId !== undefined &&
    game.opponentId !== req.user._id
  )
    return res
      .status(403)
      .send('That game already has two players. Try joining another one!');

  // U suprotnom se mozemo prijaviti
  if (game.creatorId !== req.user._id) {
    game.opponentId = req.user._id;
    await game.save();
  }

  return res
    .status(200)
    .send(
      "You successfully joined the game. When UI gets done, you'll be able to play the game."
    );
});

router.post('/makeamove/:id', auth, async (req, res) => {
  // Pronalazimo igru na osnovu ID-ja iz params
  let game = undefined;
  try {
    game = await Game.findById(req.params.id);
  } catch (ex) {
    return res
      .status(404)
      .send('That game does not exist. Try creating one instead!');
  }

  // Ukoliko je igra vec gotova i ima pobjednika
  if (game.winnerId !== undefined)
    return res.status(403).send('This game has already been finished.');

  const move = req.body;
  move.playerId = req.user._id;

  if (game.moves === undefined) game.moves = [];

  // Ako je taj potez ranije odigran, prekini izvrsavanje
  if (
    game.moves.some((moveFromDb) => {
      return (
        moveFromDb.xCoord === +move.xCoord && moveFromDb.yCoord === +move.yCoord
      );
    })
  )
    return res
      .status(403)
      .send('That move has already been selected. Choose another one.');

  // Ako je sve u redu, dodaj potez u objekat
  game.moves.push(move);

  // Provjeri da li je korisnik pobijedio
  let result = await checkForWinner(game);

  // Ukoliko je u pitanju PC, a korisnik jos nije pobijedio, odigraj odmah i njegov potez i
  // provjeri pobjednika
  if (game.isAgainstPC && game.moves.length < 9) {
    game.moves.push(pcMove(game));
    result = await checkForWinner(game);
  }

  // Sacuvaj promjene u bazi i vrati rezultat na front
  await game.save();
  return res.status(result.status).send(result.text);
});

module.exports = router;