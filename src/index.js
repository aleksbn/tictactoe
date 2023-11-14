const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const app = express();

mongoose
  .connect('mongodb://localhost/tictactoe')
  .then(() => {
    console.log('Connected to MongoBD...');
  })
  .catch((err) => console.error(err.message));

app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));