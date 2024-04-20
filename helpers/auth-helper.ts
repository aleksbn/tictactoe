import jwt from "jsonwebtoken";
import config from "config";

function generateAuthToken(id: string) {
	return jwt.sign({ _id: id }, config.get("jwtPrivateKey"));
}

export { generateAuthToken };
