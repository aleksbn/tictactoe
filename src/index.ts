import mongoose from 'mongoose';
import express from 'express';
import config from 'config';
const app = express();

import users from './routes/users';
import auth from './routes/auth';
import games from './routes/games';

app.use(express.json());
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/games', games);

if(!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwt private key is not defined');
  process.exit(1);
}

mongoose
  .connect('mongodb://localhost/tictactoe')
  .then(() => {
    console.log('Connected to MongoBD...');
  })
  .catch((err) => console.error(err.message));


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));