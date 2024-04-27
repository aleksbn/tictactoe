import { serverLogger } from "../helpers/server-logger";
import mongoose from "mongoose";

function getDb() {
	mongoose.connect("mongodb://127.0.0.1/tictactoe").then(() => {
		serverLogger.info("Application connected to MongoBD...");
	});
}

export { getDb };
