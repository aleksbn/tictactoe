import jwt from "jsonwebtoken";
import config from "config";
import { userDataLogger } from "../helpers/user-data-logger";
import { NextFunction, Response } from "express";

export default function (req: any, res: Response, next: NextFunction) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    next();
  } catch (ex) {
    userDataLogger.warning("Illegal attempt. No token provided.");
    res.status(400).send("Access denied. Invalid token.");
  }
}
