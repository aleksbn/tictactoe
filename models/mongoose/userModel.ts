import Joi from "joi";
import mongoose from "mongoose";
import { User } from "../entities/user";

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 1024,
		trim: true,
	},
	nickname: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 255,
	},
});

const UserModel = mongoose.model("User", userSchema);

function validateUser(user: User) {
	const schema = Joi.object({
		email: Joi.string().min(5).max(255).required().email(),
		nickname: Joi.string().min(3).max(255).required(),
		password: Joi.string().min(5).max(255).required(),
	});
	return schema.validate(user);
}

export { UserModel, validateUser as validate };
