import express from 'express';
import { UserModel, validate } from '../models/entities/user';
import bcrypt from 'bcrypt';
import _ from 'lodash';
const router = express.Router();
import auth from '../middleware/auth';
import jwt from 'jsonwebtoken';
import config from 'config';

router.get('/', auth, async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');
  let currentUser = await UserModel.findById(
    jwt.verify(token, config.get('jwtPrivateKey'))
  );
  res.send(currentUser);
});

router.get('/:id', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');
  let user = await UserModel.findById(req.params.id);
  res.send(user?.nickname || 'unknown');
});

router.put('/', auth, async (req, res) => {
  const id = req.body._id;
  delete req.body._id;
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);
  const editUser = req.body;

  const salt = await bcrypt.genSalt(10);
  editUser.password = await bcrypt.hash(editUser.password, salt);
  const user = await UserModel.findByIdAndUpdate(id, {
    email: editUser.email,
    password: editUser.password,
    nickname: editUser.nickname,
  });
  //@ts-ignore
  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .header('access-control-expose-headers', 'x-auth-token')
    .send(_.pick(user, ['_id', 'nickname', 'email']));
});

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
    .header('access-control-expose-headers', 'x-auth-token')
    .send(_.pick(user, ['_id', 'nickname', 'email']));
});

export default router;
