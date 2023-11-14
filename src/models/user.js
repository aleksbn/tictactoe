const joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
});

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
  };
  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
