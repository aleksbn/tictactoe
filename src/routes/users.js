const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const bcrypt = require('bcrypt');
const _ = require('lodash');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res.status(400).send('That email has already been registered.');

  user = new User(_.pick(req.body, ['nickname', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const token = user.generateAuthToken();

  await user.save();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'nickname', 'email']));
});

module.exports = router;
