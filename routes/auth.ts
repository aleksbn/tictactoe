import _ from "lodash";
import express from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import { UserModel } from "../models/mongoose/userModel";
import { generateAuthToken } from "../helpers/auth-helper";

const router = express.Router();

router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await UserModel.findOne({ email: req.body.email });
	if (!user) return res.status(400).send("Invalid email or password.");

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send("Invalid email or password.");

	const token = generateAuthToken(user._id.toString());

	res.send(token);
});

function validate(req: any) {
	const schema = Joi.object({
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required(),
	});
	return schema.validate(req);
}

export default router;
