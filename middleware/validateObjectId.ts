import mongoose from "mongoose";
import { NextFunction, Response } from "express";

export default function (req: any, res: Response, next: NextFunction) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).send("Invalid ID");
	}

	next();
}
