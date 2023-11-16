import express from 'express';
import { UserModel, validate } from '../models/user';
import bcrypt from 'bcrypt';
import _ from 'lodash';
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let user = await UserModel.findOne({ email: req.body.email });
  if (user)
    return res.status(400).send('That email has already been registered.');

  user = new UserModel(_.pick(req.body, ['nickname', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  //@ts-ignore
  const token = user.generateAuthToken();

  await user.save();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'nickname', 'email']));
});

export default router;
