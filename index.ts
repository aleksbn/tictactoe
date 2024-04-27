import express from "express";
import { serverLogger } from "./helpers/server-logger";
import { setRoutes } from "./startup/routes";
import { getDb } from "./startup/db";
import { createServer } from "./startup/socket-server";
import { checkConfig } from "./startup/config";

process.on("uncaugthException", (ex: any) => {
	serverLogger.error(ex.message);
});

process.on("unhandledRejection", (ex: any) => {
	serverLogger.error(ex.message);
});

const app = express();
setRoutes(app);
getDb();
const server = createServer(app);

try {
	checkConfig();
} catch (error: any) {
	serverLogger.error(error.message);
	process.exit(1);
}

const port = process.env.PORT || 3900;
server.listen(port, () =>
	serverLogger.info(`Socket IO server is active. Listening on port ${port}...`)
);
