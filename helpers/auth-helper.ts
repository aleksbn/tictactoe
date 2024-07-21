import jwt from "jsonwebtoken";
import config from "config";

/**
 * Generates a JSON Web Token (JWT) for authentication purposes.
 *
 * @param {string} id - The unique identifier of the user.
 * @return {string} The generated JWT.
 */
function generateAuthToken(id: string) {
  return jwt.sign({ _id: id }, config.get("jwtPrivateKey"));
}

export { generateAuthToken };
