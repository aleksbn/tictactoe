const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const app = express();

const users = require('./routes/users');
const auth = require('./routes/auth');
const games = require('./routes/games');

app.use(express.json());
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/game', games);

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