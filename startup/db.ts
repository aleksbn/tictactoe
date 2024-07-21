import { serverLogger } from "../helpers/server-logger";
import mongoose from "mongoose";
import config from "config";

/**
 * Connects to the database using the provided configuration and logs the connection status.
 */
function getDb() {
  mongoose.connect(config.get("db")).then(() => {
    serverLogger.info(`Application connected to ${config.get("db")}...`);
  });
}

export { getDb };
