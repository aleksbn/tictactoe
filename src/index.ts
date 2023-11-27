import mongoose from 'mongoose';
import express from 'express';
import config from 'config';
import cors from 'cors';
const app = express();

import users from './routes/users';
import auth from './routes/auth';
import games from './routes/games';
import history from './routes/history';
import generate from "./routes/generate";

app.use(express.json());
app.use(cors());
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/games', games);
app.use('/api/history', history);
app.use('/api/generate', generate);

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


const port = process.env.PORT || 3900;
app.listen(port, () => console.log(`Listening on port ${port}...`));