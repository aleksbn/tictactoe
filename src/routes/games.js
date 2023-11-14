const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const _ = require('lodash');
const { Game, validate } = require('../models/game');
const express = require('express');
const router = express.Router();

router.post('/create/:id', auth, async (req, res) => {
  const { error } = validate({
    creatorId: req.params.id,
    isAgainstPC: req.body.isAgainstPC,
  });
  if (error) return res.status(400).send(error.details[0].message);

  let game = new Game({
    creatorId: req.params.id,
    isAgainstPC: req.body.isAgainstPC,
  });
  await game.save();

  res.send(game._id);
});

router.get('/join/:id', auth, async (req, res) => {
  let game = undefined;
  try {
    game = await Game.findById(req.params.id);
  } catch (ex) {
    return res
      .status(404)
      .send('That game does not exist. Try creating one instead!');
  }

  if (game.hasOwnProperty('winnerId') || game.hasOwnProperty('opponentId')) {
    return res
      .status(404)
      .send(
        'That game has already been played. Try creating or joining another one!'
      );
  }

  game.opponentId = req.user._id;
  await game.save();
  return res
    .status(200)
    .send(
      "You successfully joined the game. When UI gets done, you'll be able to play the game."
    );
});

module.exports = router;
